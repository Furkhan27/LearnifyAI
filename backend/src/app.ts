import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/auth.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import graphRoutes from "./routes/graph.routes.js";
import pool from "./config/db.js";
import notesRoutes from "./routes/notesRoutes";

import aiStudyCompanionRoutes from "./routes/AIStudyCompanion.routes.js"; // after build, .js
// If running ts-node in dev, use the .ts path:
/// import aiStudyCompanionRoutes from "./routes/aiStudyCompanion.routes";



const app = Fastify({ logger: true });

await app.register(cors, { origin: "*" });
await app.register(authRoutes);
await app.register(aiRoutes);
await app.register(graphRoutes);
await app.register(aiStudyCompanionRoutes);
await app.register(notesRoutes);

console.log("🧠 Fastify initialized successfully");
export default app;
