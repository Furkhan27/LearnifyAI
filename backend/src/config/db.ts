import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("🗄️ Database connected successfully"))
  .catch((err: Error) => console.error("❌ Database connection error:", err));

export default pool;
