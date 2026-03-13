import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { errorHandler, notFound } from "./middleware/errorHandler";
import geocodeRouter from "./routes/geocode";
import { initTrackingSocket } from "./websocket/trackingSocket";

dotenv.config();

const PORT = process.env["PORT"] ?? 4000;
const ALLOWED_ORIGINS = (process.env["FRONTEND_URL"] ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

app.use("/api/geocode", geocodeRouter);
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

initTrackingSocket(httpServer);

app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
