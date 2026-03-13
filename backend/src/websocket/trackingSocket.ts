/**
 * Tracking WebSocket namespace
 *
 * Events (client → server):
 *   "subscribe"          { agentId }         — watch a specific agent
 *   "unsubscribe"        { agentId }         — stop watching
 *   "simulation:start"   SimulationStartPayload — start a simulated agent
 *   "simulation:stop"    { agentId }         — stop a running simulation
 *
 * Events (server → client):
 *   "location:update"    AgentLocation       — new position from agent
 *   "simulation:complete" { agentId }        — agent reached destination
 *   "error"              { message }
 */

import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import {
  AgentLocation,
  SimulationStartPayload,
  TrackingSubscribePayload,
} from "../types/index";
import {
  isSimulationRunning,
  startSimulation,
  stopSimulation,
} from "../services/simulationService";

const CORS_ORIGIN = process.env["FRONTEND_URL"] ?? "http://localhost:3000";

export function initTrackingSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  const trackingNs = io.of("/tracking");

  trackingNs.on("connection", (socket: Socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on("subscribe", ({ agentId }: TrackingSubscribePayload) => {
      socket.join(`agent:${agentId}`);
      console.log(`[socket] ${socket.id} subscribed to agent:${agentId}`);
    });

    socket.on("unsubscribe", ({ agentId }: TrackingSubscribePayload) => {
      socket.leave(`agent:${agentId}`);
      console.log(`[socket] ${socket.id} unsubscribed from agent:${agentId}`);
    });

    socket.on("simulation:start", (payload: SimulationStartPayload) => {
      if (isSimulationRunning(payload.agentId)) {
        socket.emit("error", { message: `Simulation for ${payload.agentId} is already running` });
        return;
      }

      console.log(`[socket] starting simulation for agent ${payload.agentId}`);

      startSimulation(
        payload,
        (loc: AgentLocation) => {
          // Broadcast to all subscribers of this agent
          trackingNs.to(`agent:${loc.agentId}`).emit("location:update", loc);
        },
        (agentId: string) => {
          trackingNs.to(`agent:${agentId}`).emit("simulation:complete", { agentId });
          console.log(`[socket] simulation complete for agent ${agentId}`);
        }
      );

      socket.join(`agent:${payload.agentId}`);
    });

    socket.on("simulation:stop", ({ agentId }: { agentId: string }) => {
      stopSimulation(agentId);
      console.log(`[socket] simulation stopped for agent ${agentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  return io;
}
