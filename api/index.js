import app, { databaseReady } from "../server/index.js";

await databaseReady;

export default app;
