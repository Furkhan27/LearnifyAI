// src/routes/aiStudyCompanion.routes.ts
import type { FastifyPluginAsync } from "fastify";
import path from "path";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import axios from "axios";
import googleTTSRaw from "google-tts-api";
import dotenv from "dotenv";
import fastifyStatic from "@fastify/static";

const pipe = promisify(pipeline);
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
if (!OPENROUTER_API_KEY) {
  // plugin will register but endpoints will error until you set OPENROUTER_API_KEY in .env
  console.warn("WARNING: OPENROUTER_API_KEY not set in .env");
}

// Minimal typing for google-tts-api
type GoogleTTS = {
  getAudioUrl: (text: string, opts: { lang: string; slow?: boolean; host?: string }) => string;
  getAllAudioUrls?: (text: string, opts: { lang: string; slow?: boolean; host?: string }) => string[];
};
const googleTTS = googleTTSRaw as unknown as GoogleTTS;

// ===== Types =====
type ChatRole = "system" | "user" | "assistant";
type Message = { role: ChatRole; content: string };

type ChatBody = {
  question: string;
  model?: string;
  temperature?: number;
  simplify?: boolean;
  language?: "English" | "Hindi" | "Spanish" | "French" | "Chinese" | string;
  playAudio?: boolean;
  sessionId?: string;
};

type HistoryItem = { role: "user" | "assistant"; text: string; time: string };

type ChatReply = {
  ok: boolean;
  text?: string;
  summary?: string | null;
  example?: string | null;
  tts?: { storedUrl?: string } | null;
  sessionId?: string;
  error?: string;
  detail?: string;
};

// ===== In-memory store (dev only) =====
const histories = new Map<string, HistoryItem[]>();

// ===== Helpers =====
function nowTime(): string {
  return new Date().toLocaleTimeString();
}

async function callOpenRouter(model: string, messages: Message[], temperature = 0.5): Promise<any> {
  const resp = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    { model, messages, temperature },
    {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      timeout: 60_000,
    }
  );
  return resp.data;
}

function splitIntoChunks(text: string, maxLen = 180): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  let current = "";
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + " " + trimmed).trim().length <= maxLen) {
      current = (current + " " + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        const words = trimmed.split(/\s+/);
        let part = "";
        for (const w of words) {
          if ((part + " " + w).trim().length <= maxLen) {
            part = (part + " " + w).trim();
          } else {
            if (part) chunks.push(part);
            part = w;
          }
        }
        current = part;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// Allowed upstream hosts (for safety)
const ALLOWED_AUDIO_HOSTS = new Set(["translate.google.com", "translate.googleapis.com"]);

// Downloads a single upstream URL (stream) and appends to dest file
async function appendUrlToFile(upstreamUrl: string, destPath: string) {
  const parsed = new URL(upstreamUrl);
  if (!ALLOWED_AUDIO_HOSTS.has(parsed.hostname)) throw new Error("Upstream host not allowed: " + parsed.hostname);

  const resp = await axios.get(upstreamUrl, {
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      Referer: "https://translate.google.com",
      Accept: "*/*",
    },
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (s) => s >= 200 && s < 400,
  });

  // ensure dest directory exists
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

  // append stream
  const writer = fs.createWriteStream(destPath, { flags: "a" });
  await pipe(resp.data, writer);
}

// Create a unique filename for stored audio
function makeFilename(prefix = "learnify", ext = "mp3") {
  const now = Date.now();
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${now}_${rand}.${ext}`;
}

// ===== Plugin =====
const aiStudyCompanionRoutes: FastifyPluginAsync = async (fastify) => {
  // Serve static audio files from project-root/public/audio at /audio/*
  const audioDir = path.join(process.cwd(), "public", "audio");
  await fs.promises.mkdir(audioDir, { recursive: true });

  // register fastify-static (safe to register even if other plugins register it; handle errors)
  try {
    await fastify.register(fastifyStatic, {
      root: audioDir,
      prefix: "/audio/",
      decorateReply: false,
    });
  } catch (err) {
    fastify.log.warn("fastify-static register warning: " + String(err));
  }

  if (!OPENROUTER_API_KEY) fastify.log.error("OPENROUTER_API_KEY not set");

  // Main endpoint
  fastify.post<{ Body: ChatBody; Reply: ChatReply }>("/api/learnify", async (request, reply) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return reply.code(500).send({ ok: false, error: "OPENROUTER_API_KEY not configured" });
      }

      const {
        question,
        model = "meta-llama/llama-3.1-70b-instruct",
        temperature = 0.5,
        simplify = true,
        language = "English",
        playAudio = true,
        sessionId,
      } = request.body ?? {};

      if (!question || typeof question !== "string" || !question.trim()) {
        return reply.code(400).send({ ok: false, error: "question is required" });
      }

      const sid = typeof sessionId === "string" && sessionId.length ? sessionId : "global";
      if (!histories.has(sid)) histories.set(sid, []);
      histories.get(sid)!.push({ role: "user", text: question, time: nowTime() });

      const systemPrompt = `You are Learnify's AI Student Companion — a friendly, patient, and clear tutor. Always explain in ${language}. Give step-by-step answers, examples, and if possible, a simpler summary in ${language}.`;

      // Build messages including recent history
      const rawHistory = histories.get(sid)!;
      const lastMessages: Message[] = rawHistory.slice(-6).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text,
      }));
      const messages: Message[] = [{ role: "system", content: systemPrompt }, ...lastMessages, { role: "user", content: question }];

      // LLM call
      const result = await callOpenRouter(model, messages, temperature);
      const ai_text: string = result?.choices?.[0]?.message?.content?.trim() ?? "No response.";
      let finalText = ai_text;

      // Short summary & example
      let shortSummary: string | null = null;
      let shortExample: string | null = null;
      if (simplify) {
        try {
          const summaryPrompt: Message[] = [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `In ${language}, provide a very short (2-3 sentence) summary of the following answer, followed by a one-sentence real-world example. Separate the summary and example clearly with a newline. Answer: ${ai_text}`,
            },
          ];
          const followup = await callOpenRouter(model, summaryPrompt, 0.2);
          const followText: string = followup?.choices?.[0]?.message?.content?.trim() ?? "";

          const doubleSplit = followText.split(/\n\s*\n/);
          if (doubleSplit.length >= 2) {
            shortSummary = doubleSplit[0].trim();
            shortExample = doubleSplit.slice(1).join("\n\n").trim() || null;
          } else {
            const singleSplit = followText.split(/\n/).map(s => s.trim()).filter(Boolean);
            if (singleSplit.length >= 2) {
              shortSummary = singleSplit.slice(0, 2).join(" ").trim();
              shortExample = singleSplit.slice(2).join(" ").trim() || null;
            } else {
              const idx = followText.toLowerCase().indexOf("example");
              if (idx !== -1) {
                shortSummary = followText.slice(0, idx).trim();
                shortExample = followText.slice(idx).trim();
              } else {
                shortSummary = followText;
                shortExample = null;
              }
            }
          }
        } catch (err) {
          fastify.log.warn("Simplify followup failed: " + String(err));
        }
      }

      histories.get(sid)!.push({ role: "assistant", text: finalText, time: nowTime() });

      // TTS: generate upstream URLs (chunks) then download and store a single MP3 file
      let tts: { storedUrl?: string } | null = null;
      if (playAudio) {
        try {
          const langMap: Record<string, string> = {
            English: "en",
            Hindi: "hi",
            Spanish: "es",
            French: "fr",
            Chinese: "zh-CN",
          };
          const langCode = langMap[language] ?? "en";
          const textToUseForTts = shortSummary ?? finalText;

          // 1) try getAllAudioUrls
          const gttsAny = googleTTS as unknown as any;
          let upstreamUrls: string[] | null = null;
          if (typeof gttsAny.getAllAudioUrls === "function") {
            try {
              const urls: string[] = gttsAny.getAllAudioUrls(textToUseForTts, {
                lang: langCode,
                slow: false,
                host: "https://translate.google.com",
              });
              if (Array.isArray(urls) && urls.length > 0) upstreamUrls = urls;
            } catch (err) {
              fastify.log.warn("getAllAudioUrls failed, falling back to manual chunking: " + String(err));
            }
          }

          // 2) fallback: manual chunking
          if (!upstreamUrls) {
            const chunks = splitIntoChunks(textToUseForTts, 180);
            const urls: string[] = [];
            for (const c of chunks) {
              try {
                const u = googleTTS.getAudioUrl(c, { lang: langCode, slow: false, host: "https://translate.google.com" });
                urls.push(u);
              } catch (err) {
                fastify.log.warn("Chunk TTS failed for chunk length " + c.length + ": " + String(err));
              }
            }
            if (urls.length > 0) upstreamUrls = urls;
          }

          if (Array.isArray(upstreamUrls) && upstreamUrls.length > 0) {
            // create filename and dest path
            const filename = makeFilename("learnify_audio", "mp3");
            const destPath = path.join(process.cwd(), "public", "audio", filename);

            // download and append all upstream chunks to destPath
            await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
            // ensure file is fresh
            try { await fs.promises.unlink(destPath); } catch (e) { /* ignore */ }

            for (const u of upstreamUrls) {
              try {
                await appendUrlToFile(u, destPath);
              } catch (err) {
                fastify.log.warn("Failed to append chunk: " + String(err));
              }
            }

            // Build storedUrl (absolute) using request headers (best-effort)
            const proto = (request.headers["x-forwarded-proto"] as string) ?? "http";
            const host = String(request.headers.host ?? "localhost:5000");
            const base = `${proto}://${host}`;
            const storedUrl = `${base}/audio/${filename}`;

            tts = { storedUrl };
          }
        } catch (err) {
          fastify.log.warn("TTS/store failed: " + String(err));
          tts = null;
        }
      }

      return reply.send({
        ok: true,
        text: finalText,
        summary: shortSummary,
        example: shortExample,
        tts,
        sessionId: sid,
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ ok: false, error: "server error", detail: err?.message || String(err) });
    }
  });

  // history endpoints...
  fastify.get("/api/learnify/history", async (request, reply) => {
    const sid = String((request.query as any)?.sessionId ?? "global");
    const hist = histories.get(sid) ?? [];
    return reply.send({ ok: true, history: hist });
  });

  fastify.post("/api/learnify/clear", async (request, reply) => {
    const sid = String((request.body as any)?.sessionId ?? "global");
    histories.set(sid, []);
    return reply.send({ ok: true });
  });
};

export default aiStudyCompanionRoutes;
