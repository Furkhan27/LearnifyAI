import { FastifyInstance } from "fastify";
import pool from "../config/db";

export default async function userRoutes(app: FastifyInstance) {
  app.get("/api/users", async (request, reply) => {
    const result = await pool.query("SELECT * FROM users");
    reply.send(result.rows);
  });
}
