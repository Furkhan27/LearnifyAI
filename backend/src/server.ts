import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    await app.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
};



start();
