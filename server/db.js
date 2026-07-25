import mongoose from "mongoose";
import dns from "dns";

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/granite-paving-stone";
const GLOBAL_CACHE_KEY = "__sjGraniteMongooseCache";
const INITIAL_RETRY_DELAY_MS = Number(process.env.MONGODB_RETRY_DELAY_MS || 5000);
const MAX_RETRY_DELAY_MS = Number(process.env.MONGODB_MAX_RETRY_DELAY_MS || 60000);
const IS_SERVERLESS = process.env.VERCEL === "1";

const dnsServers = process.env.MONGODB_DNS_SERVERS
  || (process.env.NODE_ENV === "production" ? "" : "8.8.8.8,1.1.1.1");

if (dnsServers) {
  dns.setServers(dnsServers.split(",").map((server) => server.trim()).filter(Boolean));
}

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

const cache = globalThis[GLOBAL_CACHE_KEY] || {
  connection: null,
  promise: null,
  reconnectTimer: null,
  listenersBound: false,
  isClosing: false,
  lastError: null,
  cooldownUntil: 0,
  retryDelayMs: INITIAL_RETRY_DELAY_MS,
};

globalThis[GLOBAL_CACHE_KEY] = cache;

const connectionOptions = {
  family: 4,
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 5),
  minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 0),
  maxConnecting: Number(process.env.MONGODB_MAX_CONNECTING || 2),
  maxIdleTimeMS: Number(process.env.MONGODB_MAX_IDLE_TIME_MS || 30000),
  serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000),
  socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
  connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
  heartbeatFrequencyMS: Number(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || 10000),
  retryWrites: true,
  autoIndex: process.env.NODE_ENV !== "production",
};

const readyStateName = (state) => ({
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
  99: "uninitialized",
}[state] || "unknown");

const clearReconnectTimer = () => {
  if (!cache.reconnectTimer) return;
  clearTimeout(cache.reconnectTimer);
  cache.reconnectTimer = null;
};

const scheduleReconnect = () => {
  if (IS_SERVERLESS || cache.isClosing || cache.reconnectTimer || cache.promise || isDatabaseConnected()) return;

  const delay = Math.max(INITIAL_RETRY_DELAY_MS, cache.retryDelayMs);
  cache.reconnectTimer = setTimeout(() => {
    cache.reconnectTimer = null;
    connectDatabase({ force: true }).catch(() => undefined);
  }, delay);

  cache.reconnectTimer.unref?.();
};

const bindConnectionEvents = () => {
  if (cache.listenersBound) return;
  cache.listenersBound = true;

  mongoose.connection.on("connected", () => {
    cache.connection = mongoose.connection;
    cache.lastError = null;
    cache.cooldownUntil = 0;
    cache.retryDelayMs = INITIAL_RETRY_DELAY_MS;
    clearReconnectTimer();
    console.log("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    cache.connection = null;
    if (!cache.isClosing) {
      console.warn("MongoDB disconnected; reconnect will be attempted.");
      scheduleReconnect();
    }
  });

  mongoose.connection.on("error", (error) => {
    cache.lastError = error;
    console.error("MongoDB connection error:", error?.message || error);
  });

  mongoose.connection.on("reconnected", () => {
    cache.connection = mongoose.connection;
    cache.lastError = null;
    cache.cooldownUntil = 0;
    cache.retryDelayMs = INITIAL_RETRY_DELAY_MS;
    console.log("MongoDB reconnected");
  });
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const getDatabaseState = () => ({
  connected: isDatabaseConnected(),
  readyState: mongoose.connection.readyState,
  readyStateName: readyStateName(mongoose.connection.readyState),
  host: mongoose.connection.host,
  name: mongoose.connection.name,
  lastError: cache.lastError?.message || null,
  pool: {
    maxPoolSize: connectionOptions.maxPoolSize,
    minPoolSize: connectionOptions.minPoolSize,
    maxIdleTimeMS: connectionOptions.maxIdleTimeMS,
  },
});

export const connectDatabase = async ({ force = false } = {}) => {
  bindConnectionEvents();

  if (isDatabaseConnected()) return mongoose.connection;
  if (cache.promise) return cache.promise;

  const now = Date.now();
  if (!force && cache.cooldownUntil > now) {
    throw cache.lastError || new Error("MongoDB reconnect is cooling down.");
  }

  cache.isClosing = false;
  cache.promise = mongoose.connect(process.env.MONGODB_URI || DEFAULT_MONGODB_URI, connectionOptions)
    .then(() => {
      cache.connection = mongoose.connection;
      cache.lastError = null;
      cache.cooldownUntil = 0;
      cache.retryDelayMs = INITIAL_RETRY_DELAY_MS;
      return mongoose.connection;
    })
    .catch((error) => {
      cache.connection = null;
      cache.lastError = error;
      cache.cooldownUntil = Date.now() + cache.retryDelayMs;
      cache.retryDelayMs = Math.min(cache.retryDelayMs * 2, MAX_RETRY_DELAY_MS);
      console.error("MongoDB connection failed:", error?.message || error);
      scheduleReconnect();
      throw error;
    })
    .finally(() => {
      cache.promise = null;
    });

  return cache.promise;
};

export const closeDatabase = async () => {
  cache.isClosing = true;
  clearReconnectTimer();
  cache.promise = null;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  cache.connection = null;
};

export { mongoose };
