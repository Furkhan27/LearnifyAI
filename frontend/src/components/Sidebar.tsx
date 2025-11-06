import React from "react";
import { BookOpen, PieChart, TrendingUp, Settings, Calendar } from "lucide-react";

export default function Sidebar(): JSX.Element {
  const nav = [
    { id: "overview", label: "Overview", icon: <PieChart size={16} /> },
    { id: "mycourses", label: "My Courses", icon: <BookOpen size={16} /> },
    { id: "predictions", label: "Predictions", icon: <TrendingUp size={16} /> },
    { id: "schedule", label: "Schedule", icon: <Calendar size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <aside className="p-4 bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl shadow-lg">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold">L</div>
        <div className="mt-3">
          <div className="text-sm font-semibold">LearnifyAI</div>
          <div className="text-xs text-slate-300">Student</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {nav.map((n) => (
          <button
            key={n.id}
            className="flex items-center gap-3 text-sm px-3 py-2 rounded-lg hover:bg-white/6 transition"
          >
            <span className="text-indigo-300">{n.icon}</span>
            <span className="text-slate-100">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6">
        <div className="text-xs text-slate-400">Recent Trend</div>
        <div className="mt-2 h-20 w-full bg-gradient-to-r from-indigo-500/10 to-sky-500/8 rounded-lg flex items-center justify-center text-xs text-slate-300">
          Learning momentum up 6% this week
        </div>
      </div>
    </aside>
  );
}
