import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Send, Headphones } from "lucide-react";
import Sidebar from "../components/Sidebar";

type ApiResponse = {
  ok: boolean;
  text?: string;
  summary?: string | null;
  example?: string | null;
  tts?: { storedUrl?: string } | null;
  error?: string;
};

export default function AIStudyCompanion(): JSX.Element {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🎧 Track audio progress
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (a.duration && !isNaN(a.duration)) setProgress((a.currentTime / a.duration) * 100);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [audioRef.current]);

  // 🔊 Play / Pause
  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {
        alert("Playback blocked by browser. Click play on the audio controls or allow media playback.");
      });
    }
  }

  // 🤖 Ask Learnify API
  async function ask() {
    if (!question.trim()) return;
    setShowResult(false);
    setLoading(true);
    setAnswer(null);
    setSummary(null);
    setExample(null);
    setAudioUrl(null);
    setPlaying(false);
    setProgress(0);

    try {
      const resp = await fetch("http://localhost:5000/api/learnify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, language: "English", simplify: true, playAudio: true }),
      });
      const json: ApiResponse = await resp.json();
      if (!json.ok) {
        setAnswer("❌ Error: " + (json.error ?? "Unknown error"));
      } else {
        setAnswer(json.text ?? null);
        setSummary(json.summary ?? null);
        setExample(json.example ?? null);
        setAudioUrl(json.tts?.storedUrl ?? null);
        setShowResult(true);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = json.tts?.storedUrl ?? "";
            audioRef.current.load();
          }
        }, 50);
      }
    } catch (e: any) {
      setAnswer("⚠️ Request failed: " + (e?.message ?? String(e)));
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <Sidebar role={"student"} isCollapsed={false} setIsCollapsed={function (value: React.SetStateAction<boolean>): void {
              throw new Error("Function not implemented.");
          } }/>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="flex justify-center mt-16"
    >
      <div
        className="
          w-full max-w-4xl 
          rounded-2xl 
          border border-indigo-500/20 
          bg-gradient-to-br from-[#0d1025]/60 to-[#1a1d3a]/60 
          backdrop-blur-2xl 
          p-8 
          shadow-[0_0_25px_rgba(79,70,229,0.15)] 
          transition-all 
          duration-500 
          hover:shadow-[0_0_35px_rgba(99,102,241,0.35)] 
          hover:from-[#15183b]/70 hover:to-[#1e2148]/70
          text-white
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600/20 p-3 rounded-xl border border-indigo-400/30">
            <GraduationCap className="text-indigo-300" size={22} />
          </div>
          <h2 className="text-xl font-semibold text-indigo-300">
            Learnify — AI Study Companion
          </h2>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Ask questions, get a short summary, example, and playable audio.
        </p>

        {/* Question input */}
        <div className="relative mb-6">
          <textarea
            aria-label="question"
            placeholder="Type a question (e.g., Explain Newton's third law with a basketball example)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="
              w-full h-32 resize-none rounded-xl 
              bg-white/5 text-white placeholder-gray-400 
              border border-indigo-500/30 
              focus:ring-2 focus:ring-indigo-400/60 
              focus:outline-none 
              p-4 
              backdrop-blur-lg 
              transition-all
            "
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={ask}
            disabled={loading}
            className="
              absolute bottom-3 right-3 
              px-5 py-2 
              rounded-lg 
              bg-indigo-600 hover:bg-indigo-500 
              text-white font-medium flex items-center gap-2 
              transition 
              shadow-[0_0_10px_rgba(99,102,241,0.4)]
            "
          >
            <Send size={16} />
            {loading ? "Thinking..." : "Ask Learnify"}
          </motion.button>
        </div>

        {/* Response section */}
        {showResult && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-sm text-indigo-300 mb-1 font-semibold">📘 Full Answer</h3>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                {answer ?? "No answer yet."}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-indigo-300 mb-1 font-semibold">🧩 Short Summary</h3>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg text-gray-200 text-sm">
                {summary ?? "No summary available."}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-indigo-300 mb-1 font-semibold">🎯 Real-world Example</h3>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-lg text-gray-200 text-sm">
                {example ?? "No example available."}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-indigo-300 mb-1 font-semibold">🎧 Audio</h3>
              {audioUrl ? (
                <div>
                  <audio ref={audioRef} controls className="w-full rounded-xl mt-2 backdrop-blur-md" src={audioUrl} />
                  <div className="h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <button
                      onClick={togglePlay}
                      disabled={!audioUrl}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition"
                    >
                      <Headphones size={14} />
                      {playing ? "Pause Audio" : "Play Audio"}
                    </button>
                    <a
                      href={audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      Download Audio
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm">
                  No audio available for this response.
                </div>
              )}
            </div>
          </motion.section>
        )}

        <div className="mt-8 text-sm text-gray-500 text-center">
          Powered by <span className="text-indigo-400 font-medium">LearnifyAI</span>
        </div>
      </div>
    </motion.div>
    </>
  );
}
