import { FastifyInstance } from "fastify";
import pool from "../config/db";
import jwt from "fastify-jwt";
import bcrypt from "bcryptjs";

export default async function authRoutes(app: FastifyInstance) {
  // Register the JWT plugin if not already done globally
  app.register(jwt, { secret: process.env.JWT_SECRET || "defaultsecret" });

  // 🧍‍♂️ User Registration
  app.post("/api/register", async (request, reply) => {
    try {
      const { name, email, password , role } = request.body as {
        name: string;
        email: string;
        password: string;
        role:string;
      };

      // Check if user exists
      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return reply.status(400).send({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into DB
      await pool.query(
        "INSERT INTO users (name, email, password,role, created_at) VALUES ($1, $2, $3,$4, NOW())",
        [name, email, hashedPassword,role]
      );

      reply.send({ message: "User registered successfully" });
    } catch (err) {
      console.error("Registration error:", err);
      reply.status(500).send({ message: "Server error" });
    }
  });

  // 🔐 User Login
  app.post("/api/login", async (request, reply) => {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      // Generate JWT
      const token = app.jwt.sign({ id: user.id, email: user.email });

      reply.send({ message: "Login successful", token });
    } catch (err) {
      console.error("Login error:", err);
      reply.status(500).send({ message: "Server error" });
    }
  });
}
