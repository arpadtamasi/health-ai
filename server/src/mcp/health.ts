import { randomUUID } from "node:crypto";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MCP_SCOPES } from "../auth/scopes.js";
import type { HealthApi } from "../health/api.js";
import { accessFor, DATA_TYPES, findDataType, payloadField, type DataType } from "../health/registry.js";
import { civilDateTime, listFilter, parseRange, TIME_HELP } from "../health/time.js";
import { addTool, errorResult, jsonResult, type CallContext } from "./tool.js";

export interface HealthContext extends CallContext {
  /** The Google scopes the user granted at sign-in. */
  googleScopes: string[];
  api: HealthApi;
}

const READ = { readOnlyHint: true, openWorldHint: true } as const;
const dataTypeArg = z.string().describe("A data type id from list_data_types, e.g. \"sleep\", \"steps\", \"nutrition-log\".");
const ID_PATTERN = /^[a-z0-9-]{4,63}$/;

/**
 * The resource-oriented tool set: BR-01m3eb1f9dyg49jbzkw0ke8k6d (Resource-oriented tool set) and
 * BR-01m3eb1hj8n8qg0q5kevtqnda8 (Tool annotations).
 */
export function registerHealthTools(server: McpServer, ctx: HealthContext): void {
  const lookup = (id: string): DataType | { error: string } =>
    findDataType(id) ?? { error: `Invalid argument \`data_type\`: unknown data type "${id}". Call list_data_types for the supported ids.` };

  const readable = (type: DataType) => {
    const access = accessFor(type, ctx.googleScopes);
    return access.readable ? undefined : `Cannot read \`${type.id}\`: ${access.reason}. The user can reconnect Health AI and allow it.`;
  };

  const writable = (type: DataType) => {
    if (!ctx.scopes.includes(MCP_SCOPES.write)) {
      return "This connection has read access only. The user can reconnect Health AI and allow writing to Google Health.";
    }
    const access = accessFor(type, ctx.googleScopes);
    return access.writable ? undefined : `Cannot write \`${type.id}\`: ${access.reason}.`;
  };

  // IF-01m3eb1fytpbacz2b3vfnsjrjw (list_data_types tool)
  addTool(server, ctx, "list_data_types", {
    title: "List data types",
    description:
      "Lists the Google Health data types Health AI supports: id, kind, description, whether the user can read and write it, " +
      "which aggregations exist, and for writable types the fields to send.",
    inputSchema: {},
    annotations: READ,
  }, async () => jsonResult({
    dataTypes: DATA_TYPES.map((type) => {
      const access = accessFor(type, ctx.googleScopes);
      return {
        id: type.id,
        kind: type.kind,
        description: type.description,
        readable: access.readable,
        ...(access.ownEntriesOnly ? { readableScope: "only entries written by Health AI" } : {}),
        writable: access.writable,
        ...(access.reason ? { reason: access.reason } : {}),
        aggregations: [...(type.rollUp ? ["hour"] : []), ...(type.dailyRollUp ? ["day", "week"] : [])],
        ...(type.writable && type.writeFields ? { writeFields: type.writeFields } : {}),
      };
    }),
  }));

  // IF-01m3eb1g9r4bt0fvmyf568svj5 (read_data tool)
  addTool(server, ctx, "read_data", {
    title: "Read data",
    description:
      "Returns the raw data points of one data type in a time range [start, end), newest first, as Google Health returns them. " +
      `${TIME_HELP} Sleep is matched by its end time, so a range covering this morning finds last night's sleep. ` +
      "Pass next_page_token back as page_token for more.",
    inputSchema: {
      data_type: dataTypeArg,
      start: z.string().describe("Inclusive start."),
      end: z.string().describe("Exclusive end."),
      page_size: z.number().int().min(1).max(10000).optional().describe("Maximum data points per page (sleep and exercise: at most 25)."),
      page_token: z.string().optional().describe("next_page_token from the previous page."),
    },
    annotations: READ,
  }, async ({ data_type, start, end, page_size, page_token }) => {
    const type = lookup(data_type);
    if ("error" in type) return errorResult(type.error);
    const denied = readable(type);
    if (denied) return errorResult(denied);
    const range = parseRange(start, end);
    if ("error" in range) return errorResult(range.error);
    const filter = listFilter(type, range);
    if (typeof filter !== "string") return errorResult(filter.error);
    const res = await ctx.api.listDataPoints(type.id, {
      filter,
      ...(page_size !== undefined ? { pageSize: page_size } : {}),
      ...(page_token ? { pageToken: page_token } : {}),
    });
    return jsonResult({ dataType: type.id, dataPoints: res["dataPoints"] ?? [], nextPageToken: res["nextPageToken"] ?? null });
  });

  // IF-01m3eb1gm40cg5a4wsfgzrb0xb (aggregate_data tool)
  addTool(server, ctx, "aggregate_data", {
    title: "Aggregate data",
    description:
      "Returns one data type rolled up by Google Health into hour, day or week buckets over [start, end). " +
      "Day and week buckets use local dates (e.g. start 2026-09-19, end 2026-09-26); hour buckets need timestamps with a UTC offset. " +
      "Ranges are limited to 14 days for heart-rate and active-minutes and 90 days otherwise. Types without aggregation " +
      "(e.g. sleep) are read with read_data.",
    inputSchema: {
      data_type: dataTypeArg,
      bucket: z.enum(["hour", "day", "week"]).describe("Bucket size."),
      start: z.string().describe("Inclusive start."),
      end: z.string().describe("Exclusive end."),
      page_token: z.string().optional().describe("next_page_token from the previous page (hour buckets)."),
    },
    annotations: READ,
  }, async ({ data_type, bucket, start, end, page_token }) => {
    const type = lookup(data_type);
    if ("error" in type) return errorResult(type.error);
    const denied = readable(type);
    if (denied) return errorResult(denied);
    const range = parseRange(start, end);
    if ("error" in range) return errorResult(range.error);
    if (bucket === "hour") {
      if (!type.rollUp) return errorResult(`\`${type.id}\` has no aggregation in Google Health; use read_data.`);
      if (range.kind !== "physical") return errorResult("Invalid argument `start`: hour buckets need timestamps with a UTC offset, e.g. 2026-09-25T00:00:00+02:00.");
      const res = await ctx.api.rollUp(type.id, {
        range: { startTime: range.start.iso, endTime: range.end.iso },
        windowSize: "3600s",
        ...(page_token ? { pageToken: page_token } : {}),
      });
      return jsonResult({ dataType: type.id, bucket, buckets: res["rollupDataPoints"] ?? [], nextPageToken: res["nextPageToken"] ?? null });
    }
    if (!type.dailyRollUp) return errorResult(`\`${type.id}\` has no aggregation in Google Health; use read_data.`);
    if (range.kind !== "civil") return errorResult("Invalid argument `start`: day and week buckets need local dates without a UTC offset, e.g. 2026-09-19.");
    const res = await ctx.api.dailyRollUp(type.id, {
      range: { start: civilDateTime(range.start), end: civilDateTime(range.end) },
      windowSizeDays: bucket === "week" ? 7 : 1,
      ...(page_token ? { pageToken: page_token } : {}),
    });
    return jsonResult({ dataType: type.id, bucket, buckets: res["rollupDataPoints"] ?? [], nextPageToken: res["nextPageToken"] ?? null });
  });

  // IF-01m3eb1gy6aa3z553154dgycdd (write_data, update_data and delete_data tools)
  const payload = z.record(z.string(), z.unknown())
    .describe("The data type's payload in Google Health's format; list_data_types shows the fields and an example.");

  addTool(server, ctx, "write_data", {
    title: "Write data",
    description:
      "Creates one entry of a writable data type (nutrition-log for meals, hydration-log for drinks) in the user's Google Health " +
      "account with the values given, and returns its id for update_data and delete_data.",
    inputSchema: { data_type: dataTypeArg, data: payload },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, async ({ data_type, data }) => {
    const type = lookup(data_type);
    if ("error" in type) return errorResult(type.error);
    const denied = writable(type);
    if (denied) return errorResult(denied);
    const id = `hai-${randomUUID()}`;
    const name = `users/me/dataTypes/${type.id}/dataPoints/${id}`;
    const op = await ctx.api.createDataPoint(type.id, { name, [payloadField(type.id)]: data });
    return jsonResult({ id, dataType: type.id, operation: op });
  });

  addTool(server, ctx, "update_data", {
    title: "Update data",
    description: "Replaces the values of an entry created earlier (by write_data or read back with read_data), identified by its id.",
    inputSchema: {
      data_type: dataTypeArg,
      id: z.string().describe("The entry id returned by write_data, or the data point name from read_data."),
      data: payload,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  }, async ({ data_type, id, data }) => {
    const type = lookup(data_type);
    if ("error" in type) return errorResult(type.error);
    const denied = writable(type);
    if (denied) return errorResult(denied);
    const pointId = entryId(type, id);
    if (!pointId) return errorResult(`Invalid argument \`id\`: "${id}" is not an id of a \`${type.id}\` entry.`);
    const op = await ctx.api.patchDataPoint(type.id, pointId, {
      name: `users/me/dataTypes/${type.id}/dataPoints/${pointId}`,
      [payloadField(type.id)]: data,
    });
    return jsonResult({ id: pointId, dataType: type.id, operation: op });
  });

  addTool(server, ctx, "delete_data", {
    title: "Delete data",
    description: "Deletes entries of a writable data type from the user's Google Health account by id.",
    inputSchema: {
      data_type: dataTypeArg,
      ids: z.array(z.string()).min(1).max(100).describe("Entry ids from write_data, or data point names from read_data."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  }, async ({ data_type, ids }) => {
    const type = lookup(data_type);
    if ("error" in type) return errorResult(type.error);
    const denied = writable(type);
    if (denied) return errorResult(denied);
    const pointIds: string[] = [];
    for (const raw of ids) {
      const pointId = entryId(type, raw);
      if (!pointId) return errorResult(`Invalid argument \`ids\`: "${raw}" is not an id of a \`${type.id}\` entry. Nothing was deleted.`);
      pointIds.push(pointId);
    }
    const op = await ctx.api.batchDelete(type.id, pointIds.map((p) => `users/me/dataTypes/${type.id}/dataPoints/${p}`));
    return jsonResult({ deleted: pointIds, dataType: type.id, operation: op });
  });

  // IF-01m3eb1h8hhcepg1fkb4kk5chw (get_profile and list_devices tools)
  addTool(server, ctx, "get_profile", {
    title: "Get profile",
    description: "Returns the user's Google Health profile (age, stride lengths) and settings (time zone, UTC offset, units, locale).",
    inputSchema: {},
    annotations: READ,
  }, async () => {
    const [profile, settings] = await Promise.all([ctx.api.getProfile(), ctx.api.getSettings()]);
    return jsonResult({ profile, settings });
  });

  addTool(server, ctx, "list_devices", {
    title: "List devices",
    description: "Lists the user's paired Fitbit devices with type, product name, battery and last sync time.",
    inputSchema: {},
    annotations: READ,
  }, async () => {
    const res = await ctx.api.listPairedDevices();
    return jsonResult({ devices: res["pairedDevices"] ?? [] });
  });
}

/**
 * The entry id from an id or a full data point name of this type. Names always resolve to
 * `users/me`, so an argument can never reach another user's data (BR-01m3eb1btydhctabx4d1c6zyat).
 */
function entryId(type: DataType, value: string): string | undefined {
  if (ID_PATTERN.test(value)) return value;
  const m = /^users\/[^/]+\/dataTypes\/([a-z0-9-]+)\/dataPoints\/([a-z0-9-]{4,63})$/.exec(value);
  return m && m[1] === type.id ? m[2] : undefined;
}
