#!/usr/bin/env bash
# Prints the feedback sent through Health AI's send_feedback tool, oldest first, as JSON lines:
# {"at": ISO time, "source", "kind", "tools", "message"}. Read-only. The raw userId is never printed.
# Used by the `feedback` skill (.claude/skills/feedback/SKILL.md).
#
#   scripts/read-feedback.sh [since]     since: ISO date or time, e.g. 2026-09-27 (default: 30 days ago)
#
# Needs: gcloud (signed in), python3. The project comes from PROJECT_ID or .health-ai.env.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="${PROJECT_ID:-$(grep -E '^PROJECT_ID=' "$ROOT/.health-ai.env" 2>/dev/null | tail -1 | cut -d= -f2-)}"
[[ -n "$PROJECT_ID" ]] || { echo "Set PROJECT_ID or run scripts/bootstrap.sh first." >&2; exit 1; }
SINCE="${1:-$(python3 -c 'import datetime;print((datetime.datetime.now(datetime.timezone.utc)-datetime.timedelta(days=30)).date().isoformat())')}"
TOKEN="$(gcloud auth print-access-token)"
URL="https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default)/documents/feedback?pageSize=300"

PAGE=""
{
  while :; do
    RESP="$(curl -fsS -H "authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT_ID" "$URL${PAGE:+&pageToken=$PAGE}")"
    printf '%s' "$RESP" | python3 -c 'import json,sys;print(json.dumps(json.load(sys.stdin)))'
    PAGE="$(printf '%s' "$RESP" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("nextPageToken",""))')"
    [[ -n "$PAGE" ]] || break
  done
} | SINCE="$SINCE" python3 -c '
import datetime, json, os, sys

def value(v):
    kind, val = next(iter(v.items()))
    if kind == "arrayValue":
        return [value(x) for x in val.get("values", [])]
    if kind == "integerValue":
        return int(val)
    if kind == "doubleValue":
        return float(val)
    return val

since = os.environ["SINCE"]
since_dt = datetime.datetime.fromisoformat(since.replace("Z", "+00:00"))
if since_dt.tzinfo is None:
    since_dt = since_dt.replace(tzinfo=datetime.timezone.utc)
rows = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    for doc in json.loads(line).get("documents", []):
        f = {k: value(v) for k, v in doc.get("fields", {}).items()}
        created = f.get("createdAt")
        if not isinstance(created, (int, float)):
            continue
        at = datetime.datetime.fromtimestamp(created / 1000, datetime.timezone.utc)
        if at < since_dt:
            continue
        rows.append((at, {
            "at": at.isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "source": f.get("source"), "kind": f.get("kind"),
            "tools": f.get("tools", []), "message": f.get("message"),
        }))
for _, r in sorted(rows, key=lambda x: x[0]):
    print(json.dumps(r, ensure_ascii=False))
'
