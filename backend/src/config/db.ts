import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// ✅ Optional: listen for unexpected errors instead of crashing
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
});

console.log("🗄️ PostgreSQL pool initialized successfully");

export default pool;
