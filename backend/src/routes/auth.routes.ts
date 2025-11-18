import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import pool from "../config/db";
import { registerAuthMiddleware } from '../middleware/auth.middleware';

export default async function authRoutes(app: FastifyInstance) {

    await registerAuthMiddleware(app);
  // 🧍‍♂️ Register new user
  app.post("/api/register", async (request, reply) => {
    try {
      const { name, email, password, role } = request.body as {
        name: string;
        email: string;
        password: string;
        role: string;
      };

      // ✅ PostgreSQL uses $1 instead of ?
      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        return reply.status(400).send({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        [name, email, hashedPassword, role]
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"LearnifyAI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🎉 Welcome to LearnifyAI!",
        html: `
          <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #4f46e5;">Welcome, ${name}!</h2>
              <p>Thank you for signing up for <strong>LearnifyAI</strong> 🎓.</p>
              <p>Your account has been created successfully — you can now log in and start your personalized learning journey!</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>The LearnifyAI Team</strong></p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return reply.send({ message: "Signup successful! You can now log in." });
    } catch (error: any) {
      console.error("❌ Registration Error:", error);
      return reply.status(500).send({ message: error.message || "Server error" });
    }
  });

  // 🔐 Login user
  app.post("/api/login", async (request, reply) => {
    try {
      const { email, password } = request.body as { email: string; password: string };

      const rows = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows.rows[0];

      if (!user) {
        return reply.status(400).send({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.status(400).send({ message: "Invalid password" });
      }
      const token = app.generateToken(user);

      return reply.send({ message: "Login successful", token, user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }});

    
    } catch (error: any) {
      console.error("❌ Login Error:", error);
      return reply.status(500).send({ message: error.message || "Server error" });
    }
  });
}
