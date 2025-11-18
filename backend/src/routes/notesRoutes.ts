import { FastifyInstance } from "fastify";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();
console.log("📁 Google Drive Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID || "1k9N2hjvo6v0pOZGmr4QeG7sFKqA4N74f");

export default async function notesRoutes(app: FastifyInstance) {
  app.get("/api/notes", async (request, reply) => {
    try {
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      });

      const drive = google.drive({ version: "v3", auth });
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1k9N2hjvo6v0pOZGmr4QeG7sFKqA4N74f";

      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, webViewLink, iconLink)",
      });

      const files = res.data.files || [];
      reply.send(files);
    } catch (error: any) {
      console.error("❌ Error fetching notes:", error);
      reply.status(500).send({
        message: "Failed to fetch notes",
        error: error.message,
      });
    }
  });
}
