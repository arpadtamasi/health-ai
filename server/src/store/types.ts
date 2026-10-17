import type { OAuthClientInformationFull } from "@modelcontextprotocol/sdk/shared/auth.js";

export type ClientRecord = OAuthClientInformationFull;

/** A pending /authorize or reconnect, keyed by the `state` sent to Google. */
export interface AuthRequest {
  id: string;
  kind: "connect" | "reconnect" | "app" | "app-connect";
  createdAt: number;
  clientId?: string;
  redirectUri?: string;
  codeChallenge?: string;
  clientState?: string;
  resource?: string;
  /** For reconnects: the user the link was issued to. */
  userId?: string;
  loginHint?: string;
}

export interface AuthCode {
  codeHash: string;
  clientId: string;
  userId: string;
  codeChallenge: string;
  redirectUri: string;
  resource?: string;
  scopes: string[];
  createdAt: number;
  usedAt?: number;
}

export interface Grant {
  id: string;
  userId: string;
  clientId: string;
  scopes: string[];
  createdAt: number;
  revokedAt?: number;
}

export interface RefreshToken {
  tokenHash: string;
  grantId: string;
  userId: string;
  createdAt: number;
  usedAt?: number;
}

export interface User {
  /** Google account id (`sub`). */
  id: string;
  email: string;
  grantedScopes: string[];
  /** Google refresh token, sealed; never stored in plain text. Absent until Google Health is connected (the app also works without it). */
  googleRefreshTokenSealed?: string;
  status: "active" | "needs_reconnect";
  createdAt: number;
  updatedAt: number;
}

export interface AllowEntry {
  email: string;
  owner?: boolean;
}

export interface ReconnectNonce {
  nonce: string;
  userId: string;
  createdAt: number;
  usedAt?: number;
}

export const FEEDBACK_SOURCES = ["user", "agent"] as const;
export const FEEDBACK_KINDS = ["bug", "confusing", "too_many_calls", "missing_capability", "other"] as const;

/** Feedback about the service, readable only by the owner (design D6b). */
export interface FeedbackRecord {
  id: string;
  userId: string;
  source: (typeof FEEDBACK_SOURCES)[number];
  kind: (typeof FEEDBACK_KINDS)[number];
  tools: string[];
  message: string;
  createdAt: number;
  /** Firestore TTL field: 90 days after `createdAt`. */
  expireAt: number;
}

/** Why a tool was called; `intent` is null when the agent sent none. */
export interface IntentRecord {
  id: string;
  userId: string;
  tool: string;
  intent: string | null;
  createdAt: number;
  /** Firestore TTL field: 90 days after `createdAt`. */
  expireAt: number;
}

/** What the app needs to know about a person besides Google data: goals, eating window, foods to avoid, consent. */
export interface AppSettings {
  userId: string;
  goals: { calories: number; carbs: number; protein: number; /** Fat goal in grams; derived from the calories when absent. */ fat?: number; /** Daily water goal in millilitres; the default applies when absent. */ waterMl?: number };
  window: { startHour: number; endHour: number };
  /** Allergies and foods to avoid, as the person said them. */
  constraints: string[];
  /** Set when the first chat onboarding finished with an explicit list (an empty list counts) and the consent. */
  onboardedAt?: number;
  consentAt?: number;
  updatedAt: number;
}

/** Languages the app speaks: its own texts exist in these, and the chat answers in the saved one. */
export const LANGUAGES = ["en", "hu"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Small per-person preferences that exist before the setup is done (so they cannot live in AppSettings). */
export interface AppPrefs {
  userId: string;
  language?: Language;
  /** IANA time zone of the person's device: the day, the pace and the meal type are read in it. */
  timeZone?: string;
  updatedAt: number;
}

export const DEFAULT_WATER_GOAL_ML = 2000;

/**
 * A meal or a drink the person logged, kept in the service's own storage until they delete it (BR: Meals and water kept by the
 * service belong to the person). Never holds a photo or chat text.
 */
export interface Entry {
  id: string;
  userId: string;
  kind: "meal" | "water";
  name: string;
  kcal: number;
  carbs: number;
  protein: number;
  /** Grams of fat; entries from before fat was tracked have none. */
  fat?: number;
  /** Set when the person or the assistant fixed the meal type; otherwise it follows the time of day. */
  mealType?: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
  /** Millilitres, for water. */
  ml?: number;
  /** The ingredients the model recognised, for meals that came from a photo or from the chat. */
  ingredients: string[];
  source: "photo" | "typed" | "button" | "chat";
  /** True when the values were estimated (a photo, a described meal) and not entered exactly. */
  estimate: boolean;
  /** When it was eaten or drunk, epoch milliseconds. */
  at: number;
  /** The resource name of its copy in Google Health, once mirrored. */
  googleName?: string;
}

/**
 * One message of the app's chat, kept during the test (BR "The chat is kept during the test"): the person's text, or the
 * assistant's answer as the events it produced. Never holds a photo, only how many were sent. Expires after the retention period.
 */
export interface ChatRecord {
  id: string;
  userId: string;
  at: number;
  role: "user" | "assistant";
  text?: string;
  /** How many photos came with a user message; the photos themselves are not kept. */
  images?: number;
  /** The assistant's events (text, options, logged, updated, ...), as sent to the app. */
  events?: unknown[];
  usage?: { inputTokens: number; outputTokens: number };
  /** Firestore TTL field. */
  expireAt: number;
}

/** A half-open time range [from, to) in epoch milliseconds. */
export interface TimeRange {
  from: number;
  to: number;
}

/**
 * Persistence for the authorization server. Methods named `take`/`markUsed`/`consume`
 * must be atomic: they succeed for exactly one caller.
 */
export interface Store {
  getClient(clientId: string): Promise<ClientRecord | undefined>;
  putClient(client: ClientRecord): Promise<void>;

  putAuthRequest(req: AuthRequest): Promise<void>;
  takeAuthRequest(id: string): Promise<AuthRequest | undefined>;

  putAuthCode(code: AuthCode): Promise<void>;
  getAuthCode(codeHash: string): Promise<AuthCode | undefined>;
  markAuthCodeUsed(codeHash: string, at: number): Promise<boolean>;

  putGrant(grant: Grant): Promise<void>;
  getGrant(id: string): Promise<Grant | undefined>;
  revokeGrant(id: string, at: number): Promise<void>;
  revokeGrantsOfUser(userId: string, at: number): Promise<void>;

  putRefreshToken(token: RefreshToken): Promise<void>;
  getRefreshToken(tokenHash: string): Promise<RefreshToken | undefined>;
  markRefreshTokenUsed(tokenHash: string, at: number): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  putUser(user: User): Promise<void>;

  getAllowEntry(email: string): Promise<AllowEntry | undefined>;

  putReconnectNonce(nonce: ReconnectNonce): Promise<void>;
  consumeReconnectNonce(nonce: string, at: number): Promise<ReconnectNonce | undefined>;

  putFeedback(record: FeedbackRecord): Promise<void>;
  /** All users' feedback in the range, newest first. Owner tools only. */
  listFeedback(range: TimeRange, limit: number): Promise<FeedbackRecord[]>;
  putIntent(record: IntentRecord): Promise<void>;
  /** All users' intent records in the range, newest first. Owner tools only. */
  listIntents(range: TimeRange): Promise<IntentRecord[]>;

  /**
   * Deletes everything stored for the user: the user record, grants, refresh tokens,
   * authorization codes, reconnect nonces, feedback and intents.
   */
  getAppSettings(userId: string): Promise<AppSettings | undefined>;
  putAppSettings(settings: AppSettings): Promise<void>;

  getAppPrefs(userId: string): Promise<AppPrefs | undefined>;
  putAppPrefs(prefs: AppPrefs): Promise<void>;

  putEntry(entry: Entry): Promise<void>;
  /** One person's entries in the range, oldest first. */
  listEntries(userId: string, range: TimeRange): Promise<Entry[]>;
  getEntry(userId: string, id: string): Promise<Entry | undefined>;
  deleteEntry(userId: string, id: string): Promise<void>;
  /** Removes every entry of one person and returns what was removed (the caller removes the Google Health copies). */
  deleteAllEntries(userId: string): Promise<Entry[]>;

  putChat(record: ChatRecord): Promise<void>;
  /** The latest messages of one person, oldest first. */
  listChat(userId: string, limit: number): Promise<ChatRecord[]>;
  deleteAllChat(userId: string): Promise<number>;

  /** Model tokens used by one user on one local day (the daily limit counts these). */
  getTokenUsage(userId: string, day: string): Promise<number>;
  /** Adds tokens and returns the new total for that user and day. Atomic. */
  addTokenUsage(userId: string, day: string, tokens: number, expireAtMs: number): Promise<number>;

  deleteUserData(userId: string): Promise<void>;
}
