import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Trash2, Plus, RefreshCw, GraduationCap, Send, Headphones } from "lucide-react";
import Sidebar from "../components/Sidebar";


type Topic = {
  id: string;
  topic: string;
  notes: string;
  difficulty: string;
  next_revision: string;
  created_at?: string | null;
};

const BASE = "http://localhost:8000";
const ENDPOINT = `${BASE.replace(/\/$/, "")}/api/revision`;

export default function AIRevisionEng(): JSX.Element {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [saving, setSaving] = useState(false);

  // AI Companion states
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  async function loadTopics() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error(`Failed to load topics (${res.status})`);
      const body = await res.json();
      const arr = Array.isArray(body) ? body : body?.topics ?? [];
      const mapped: Topic[] = arr.map((t: any) => ({
        id: t.id ?? String(t._id ?? t._id?.$oid ?? ""),
        topic: t.topic ?? "",
        notes: t.notes ?? "",
        difficulty: t.difficulty ?? "",
        next_revision: t.next_revision ?? "",
        created_at: t.created_at ?? null,
      }));
      setTopics(mapped);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!topicInput.trim()) return setError("Please enter a topic name.");

    setSaving(true);
    try {
      const payload = { topic: topicInput.trim(), notes: notesInput.trim(), difficulty };
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Add failed (${res.status})`);
      const newTopic = await res.json();
      setTopics((prev) => [normalize(newTopic), ...prev]);
      setTopicInput("");
      setNotesInput("");
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Mark this topic as done?")) return;
    const prev = topics;
    setTopics((s) => s.filter((t) => t.id !== id));
    try {
      const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message ?? err));
      setTopics(prev);
    }
  }

  function normalize(raw: any): Topic {
    return {
      id: raw.id ?? String(raw._id ?? raw._id?.$oid ?? ""),
      topic: raw.topic ?? "",
      notes: raw.notes ?? "",
      difficulty: raw.difficulty ?? "Easy",
      next_revision: raw.next_revision ?? "",
      created_at: raw.created_at ?? null,
    };
  }

  async function handleAskAI() {
    if (!question.trim()) return;
    setAiLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:8000/api/ai-companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI response");

      const data = await res.json();
      setResponse(data.answer ?? "No response received from AI.");
    } catch (err) {
      console.error(err);
      setResponse("⚠️ Failed to connect to LearnifyAI backend.");
    } finally {
      setAiLoading(false);
    }
  }


  return (
    <>
      <Sidebar role={"student"} isCollapsed setIsCollapsed={function (value: React.SetStateAction<boolean>): void {
        throw new Error("Function not implemented.");
      }} />
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#101828] to-[#1e293b] text-white py-12 px-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3"
            >
              <Brain className="text-indigo-400" /> Smart Revision Engine
            </motion.h1>
            <span className="text-gray-400 text-sm">🧠 LearnifyAI | AI-Powered Learning</span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-2 text-sm backdrop-blur-md"
            >
              {error}
            </motion.div>
          )}

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Topic Form */}
            <motion.section
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                <Plus size={20} /> Add New Topic
              </h2>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300">Topic</label>
                  <input
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    placeholder="e.g. Neural Networks"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300">Difficulty</label>
                  <select
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300">Notes</label>
                  <textarea
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 outline-none transition min-h-[100px]"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="e.g. Key takeaways, formulas..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={saving}
                    type="submit"
                    className={`px-5 py-2 rounded-lg font-medium transition-all ${saving
                        ? "bg-indigo-400/50 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500"
                      }`}
                  >
                    {saving ? "Saving..." : "Add Topic"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setTopicInput("");
                      setNotesInput("");
                      setDifficulty("Easy");
                    }}
                    className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                    type="button"
                  >
                    Reset
                  </motion.button>

                  <motion.button
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    onClick={() => loadTopics()}
                    className="ml-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    type="button"
                  >
                    <RefreshCw size={18} />
                  </motion.button>
                </div>
              </form>
            </motion.section>

            {/* Topics List */}
            <motion.section
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-300 flex items-center gap-2">
                  <BookOpen size={20} /> Upcoming Revisions
                </h2>
                <span className="text-gray-400 text-sm">
                  {loading ? "Loading..." : `${topics.length} topics`}
                </span>
              </div>

              {loading && topics.length === 0 ? (
                <p className="text-gray-400 text-sm">Fetching topics...</p>
              ) : topics.length === 0 ? (
                <p className="text-gray-400 text-sm">No topics yet — add one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {topics.map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border border-white/10 bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center backdrop-blur-lg hover:bg-white/10 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{t.topic}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${t.difficulty === "Easy"
                                ? "bg-green-500/20 text-green-300"
                                : t.difficulty === "Medium"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                          >
                            {t.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mt-1">{t.notes}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Next: <span className="font-mono text-indigo-300">{t.next_revision}</span>
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleDelete(t.id)}
                        className="mt-3 sm:mt-0 sm:ml-3 flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                      >
                        <Trash2 size={16} /> Done
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Glassmorphic AI Study Companion */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <div className="w-full max-w-3xl rounded-2xl p-8 border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:bg-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-400/30">
                  <GraduationCap className="text-indigo-300" size={22} />
                </div>
                <h2 className="text-xl font-semibold text-indigo-300">
                  Learnify — Revision Engine
                </h2>
              </div>

              <p className="text-gray-400 text-sm mb-6">
                Ask questions, get a short summary, example, and playable audio.
              </p>

              <div className="relative mb-6">
                <textarea
                  className="w-full h-28 resize-none rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:ring-2 focus:ring-indigo-400/60 focus:outline-none p-4 backdrop-blur-lg transition-all"
                  placeholder="Type a question (e.g., Explain Newton's third law with a basketball example)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                ></textarea>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                >
                  <Send size={16} />
                  {aiLoading ? "Asking..." : "Ask Learnify"}
                </motion.button>
              </div>

              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4 p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-gray-200 text-sm leading-relaxed whitespace-pre-line shadow-inner"
                >
                  {response}
                </motion.div>
              )}

              <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Headphones size={14} className="text-indigo-400" />
                  <span>Play or download AI-generated audio</span>
                </div>
                <span>Powered by LearnifyAI ⚡</span>
              </div>
            </div>
          </motion.div>

          <footer className="mt-12 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} LearnifyAI — Smart Study Reinvented
          </footer>
        </div>
      </div>
    </>
  );
}
