import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { errorHandler, notFound } from "./middleware/errorHandler";
import geocodeRouter from "./routes/geocode";
import { initTrackingSocket } from "./websocket/trackingSocket";

dotenv.config();

const PORT = process.env["PORT"] ?? 4000;
const FRONTEND_URL = process.env["FRONTEND_URL"] ?? "http://localhost:3000";

const app = express();
const httpServer = createServer(app);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// ─── REST Routes ─────────────────────────────────────────────────────────────
app.use("/api/geocode", geocodeRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── WebSocket ───────────────────────────────────────────────────────────────
initTrackingSocket(httpServer);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] CORS allowed origin: ${FRONTEND_URL}`);
});
