import Fastify from "fastify";
import cors from "@fastify/cors";
import pool from "./config/db";
import userRoutes from "./routes/users.routes";
import authRoutes from "./routes/auth.routes";

const app = Fastify();

// ✅ Allow frontend access
app.register(cors, {
  origin: "*", // You can later restrict this to http://localhost:3000
});

app.get("/", async () => {
  const result = await pool.query("SELECT NOW()");
  return { message: "Learnify AI backend connected!", time: result.rows[0].now };
});

app.register(userRoutes);
app.register(authRoutes);

export default app;
