import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import graphRoutes from "./routes/graph.routes.js";
import pool from "./config/db.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: "*" });
await app.register(authRoutes);
await app.register(aiRoutes);
await app.register(graphRoutes);

console.log("🧠 Fastify initialized successfully");
export default app;
