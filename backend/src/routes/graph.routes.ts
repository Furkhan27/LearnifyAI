import { FastifyInstance } from "fastify";
import pool from "../config/db";

export default async function graphRoutes(app: FastifyInstance) {
  // ➕ Add a new concept
  app.post("/api/graph/concept", async (request, reply) => {
    try {
      const { studentId, label, text, source } = request.body as {
        studentId: number;
        label: string;
        text?: string;
        source?: string;
      };

      if (!studentId || !label)
        return reply.status(400).send({ message: "studentId and label are required" });

      const { rows: existing } = await pool.query(
        "SELECT id FROM concepts WHERE student_id=$1 AND label=$2",
        [studentId, label]
      );

      if (existing.length > 0)
        return reply.send({ message: "Concept already exists", id: existing[0].id });

      const { rows } = await pool.query(
        `INSERT INTO concepts (student_id, label, text, source)
         VALUES ($1,$2,$3,$4)
         RETURNING id`,
        [studentId, label, text || "", source || "manual"]
      );

      return reply.send({ message: "Concept added successfully", id: rows[0].id });
    } catch (err) {
      console.error("Error adding concept:", err);
      return reply.status(500).send({ message: "Server error" });
    }
  });

  // 🔗 Link two concepts
  app.post("/api/graph/link", async (request, reply) => {
    try {
      const { studentId, fromId, toId, relationType, weight } = request.body as any;

      await pool.query(
        `INSERT INTO concept_edges (student_id, from_concept, to_concept, relation_type, weight)
         VALUES ($1,$2,$3,$4,$5)`,
        [studentId, fromId, toId, relationType || "related", weight || 1.0]
      );

      return reply.send({ message: "Link created successfully" });
    } catch (err) {
      console.error("Error linking concepts:", err);
      return reply.status(500).send({ message: "Server error" });
    }
  });

  // 📊 Get a student’s graph
  app.get("/api/graph/:studentId", async (request, reply) => {
    try {
      const { studentId } = request.params as any;

      const { rows: concepts } = await pool.query(
        "SELECT * FROM concepts WHERE student_id=$1",
        [studentId]
      );

      const { rows: edges } = await pool.query(
        "SELECT * FROM concept_edges WHERE student_id=$1",
        [studentId]
      );

      return reply.send({ concepts, edges });
    } catch (err) {
      console.error("Error fetching graph:", err);
      return reply.status(500).send({ message: "Server error" });
    }
  });
}
