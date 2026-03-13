import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { AgentLocation, SimulationStartPayload, TrackingSubscribePayload } from "../types/index";
import { isSimulationRunning, startSimulation, stopSimulation } from "../services/simulationService";

const CORS_ORIGIN = process.env["FRONTEND_URL"] ?? "http://localhost:3000";

export function initTrackingSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
  });

  const ns = io.of("/tracking");

  ns.on("connection", (socket: Socket) => {
    socket.on("subscribe", ({ agentId }: TrackingSubscribePayload) => {
      socket.join(`agent:${agentId}`);
    });

    socket.on("unsubscribe", ({ agentId }: TrackingSubscribePayload) => {
      socket.leave(`agent:${agentId}`);
    });

    socket.on("simulation:start", (payload: SimulationStartPayload) => {
      if (isSimulationRunning(payload.agentId)) {
        socket.emit("error", { message: `Simulation for ${payload.agentId} is already running` });
        return;
      }

      startSimulation(
        payload,
        (loc: AgentLocation) => ns.to(`agent:${loc.agentId}`).emit("location:update", loc),
        (agentId: string) => ns.to(`agent:${agentId}`).emit("simulation:complete", { agentId })
      );

      socket.join(`agent:${payload.agentId}`);
    });

    socket.on("simulation:stop", ({ agentId }: { agentId: string }) => {
      stopSimulation(agentId);
    });
  });

  return io;
}
