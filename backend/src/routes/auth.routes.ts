import { FastifyInstance } from "fastify";
import pool from "../config/db";
import jwt from "fastify-jwt";
import bcrypt from "bcryptjs";

export default async function authRoutes(app: FastifyInstance) {
  // ✅ Register JWT plugin if not already done globally
  app.register(jwt, { secret: process.env.JWT_SECRET || "defaultsecret" });

  // 🧍‍♂️ User Registration Route
  app.post("/api/register", async (request, reply) => {
    try {
      const { name, email, password, role, stream } = request.body as {
        name: string;
        email: string;
        password: string;
        role: string;
        stream: string;
      };

      // ✅ Validate input
      if (!name || !email || !password || !role) {
        return reply.status(400).send({ message: "All required fields must be filled" });
      }

      // ✅ Check if user already exists
      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return reply.status(400).send({ message: "User already exists" });
      }

      // ✅ Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert into Supabase
      await pool.query(
        "INSERT INTO users (name, email, password, role, stream, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
        [name, email, hashedPassword, role, stream]
      );

      return reply.status(201).send({ message: "User registered successfully" });
    } catch (err) {
      console.error("❌ Registration error:", err);
      return reply.status(500).send({ message: "Server error during registration" });
    }
  });

  // 🔐 User Login Route
  app.post("/api/login", async (request, reply) => {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        return reply.status(400).send({ message: "Email and password are required" });
      }

      // ✅ Fetch user from DB
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      // ✅ Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(400).send({ message: "Invalid credentials" });
      }

      // ✅ Generate JWT token
      const token = app.jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        { expiresIn: "7d" }
      );

      // ✅ Send response
      return reply.send({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          stream: user.stream,
        },
      });
    } catch (err) {
      console.error("❌ Login error:", err);
      return reply.status(500).send({ message: "Server error during login" });
    }
  });
}
