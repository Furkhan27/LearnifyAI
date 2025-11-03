import app from "./app";

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 5000, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
