import { FastifyInstance } from "fastify";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// ✅ Correct initialization for @google/generative-ai
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function aiRoutes(app: FastifyInstance) {
  // ----------------------------------------------------
  // 🧠 1️⃣ AI ROADMAP GENERATION
  // ----------------------------------------------------
  app.post("/api/roadmap", async (request, reply) => {
    try {
      const { goal } = request.body as { goal: string };
      if (!goal) {
        return reply.status(400).send({ message: "Goal is required" });
      }

      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `
        You are an expert AI mentor.
        Create a detailed, step-by-step roadmap for learning "${goal}".
        Include phases, key concepts, and practical exercises.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const steps = text
        .split(/\n|•|-/)
        .map((x) => x.trim())
        .filter((x) => x.length > 0);

      reply.send({ steps });
    } catch (error: any) {
      console.error("❌ Gemini API Error:", error);
      reply.status(500).send({
        message: "Gemini API request failed",
        error: error.message,
      });
    }
  });

  // ----------------------------------------------------
  // 🤖 2️⃣ AI PARENT NODE SUGGESTION
  // ----------------------------------------------------
  app.post("/api/suggest-parent", async (request, reply) => {
    try {
      const { newNode, existingNodes } = request.body as {
        newNode: string;
        existingNodes: string[];
      };

      if (!newNode || !existingNodes || existingNodes.length === 0) {
        return reply.status(400).send({ message: "Invalid input" });
      }

      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const prompt = `
      You are an intelligent Knowledge Graph assistant.
      You are given a list of existing learning topics:

      ${existingNodes.join(", ")}

      Now, analyze this list and decide which topic is the most logical parent
      for the new concept: "${newNode}".

      Return ONLY the parent topic name exactly as it appears in the list — no extra words or punctuation.
      `;

      const result = await model.generateContent(prompt);
      const parent = result.response.text().trim();

      console.log(`🧩 Suggested parent for "${newNode}": ${parent}`);

      return reply.send({ parent });
    } catch (error: any) {
      console.error("❌ Gemini Parent Suggestion Error:", error);
      reply.status(500).send({
        message: "Gemini API parent suggestion failed",
        error: error.message,
      });
    }
  });
}
