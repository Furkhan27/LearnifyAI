import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Book,
  Brain,
  Lightbulb,
  Bot,
  Repeat,
  FileText,
  Settings,
  LogOut,
  ClipboardList,
  BarChartIcon,
  Home,
  Menu,
  GraduationCap,
   User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import KpiCard from "../components/KpiCard";
import ProgressChart from "../components/ProgressChart";
import SkillBar from "../components/SkillBar";
import ActivityItem from "../components/ActivityItem";

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.name) setStudentName(user.name.split(" ")[0]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const features = [
    { icon: Home, label: "Dashboard", path: "/student" },
    { icon: Book, label: "Notes", path: "/student/notes" },
    { icon: Brain, label: "Knowledge Graph", path: "/knowledge-graph" },
    { icon: Bot, label: "AI Study Companion", path: "/student/study-companion" },
    { icon: Repeat, label: "Smart Revision Engine", path: "/student/revision" },
    { icon: FileText, label: "Progress Journal", path: "/student/journal" },
    {icon: ClipboardList, label: "AI Quiz Generator" , path: "/student/ai-quiz" },
    { icon: BarChartIcon, label: "Perfoemance", path: "/CEEAly/performance" },
    { icon: Settings, label: "Settings", path: "/student/settings" },
  ];

  return (
    <div className="grid grid-cols-[auto,1fr] min-h-screen bg-gradient-to-b from-[#060c1a] via-[#0b1220] to-[#0b1626] text-slate-100 font-poppins">
      <Toaster position="top-center" />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 90 : 260 }}
        transition={{ duration: 0.4 }}
        className="h-screen bg-white/10 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shadow-2xl sticky top-0 z-50"
      >
        <div>
          {/* Logo + Toggle */}
          <div
            className="flex items-center justify-between px-4 py-4 border-b border-white/10 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                <GraduationCap size={20} className="text-white" />
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h1 className="text-lg font-semibold text-indigo-400">
                    LearnifyAI
                  </h1>
                  <p className="text-xs text-slate-400 -mt-1">
                    AI Progress Predictor
                  </p>
                </motion.div>
              )}
            </div>
            {!collapsed && (
              <Menu size={18} className="text-slate-300 hover:text-white transition" />
            )}
          </div>

          {/* Feature Links */}
          <nav className="mt-4 space-y-1 px-2">
            {features.map((f) => (
              <motion.button
                key={f.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(f.path)}
                className={`w-full flex items-center gap-3 ${
                  collapsed ? "justify-center" : "px-5"
                } py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300`}
              >
                <f.icon size={20} />
                {!collapsed && <span className="text-sm">{f.label}</span>}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={`m-4 mb-6 flex items-center ${
            collapsed ? "justify-center" : "justify-center gap-2"
          } bg-red-600/80 hover:bg-red-500 border border-white/10 text-white py-2 rounded-lg transition-all duration-300`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <motion.div layout className="flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 py-3 shadow-lg">
          <h2 className="text-xl font-semibold text-white">
            Welcome, <span className="text-indigo-400">{studentName}</span> 👋
          </h2>
          <button
            className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-slate-200 hover:bg-white/20 transition-all duration-300"
          >
            <User size={18} className="text-indigo-300" />
            <span className="text-sm hidden sm:block">{studentName}</span>
          </button>
        </header>

        {/* Main Content */}
        <motion.main layout className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KpiCard title="Current Score" value="82%" trend="+4%" />
            <KpiCard title="Risk Level" value="Low" />
            <KpiCard title="Next Prediction" value="85%" />
          </div>

          {/* Performance Chart */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Performance & Prediction
              </h3>
              <span className="text-xs text-slate-400">
                Updated: Nov 6, 2025
              </span>
            </div>
            <div className="mt-4 h-64">
              <ProgressChart
                data={[
                  { week: "W1", score: 72, predicted: 74 },
                  { week: "W2", score: 68, predicted: 70 },
                  { week: "W3", score: 75, predicted: 76 },
                  { week: "W4", score: 78, predicted: 80 },
                  { week: "W5", score: 82, predicted: 85 },
                ]}
              />
            </div>
          </motion.section>

          {/* Skills + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              layout
              className="col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="font-semibold text-lg mb-3 text-white">
                Skill Breakdown
              </h3>
              <div className="space-y-3">
                {["Algebra", "Geometry", "Statistics", "Calculus"].map((s, i) => (
                  <SkillBar key={s} name={s} pct={[85, 70, 63, 56][i]} />
                ))}
              </div>
            </motion.div>

            <motion.div
              layout
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="font-semibold text-lg mb-3 text-white">
                Recent Activity
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { id: 1, title: "Completed Quiz: Algebra I", time: "2 days ago", result: "+6 pts" },
                  { id: 2, title: "Watched: Time Management", time: "3 days ago", result: "Viewed" },
                  { id: 3, title: "Submitted Assignment: Statistics", time: "5 days ago", result: "85%" },
                ].map((a) => (
                  <ActivityItem key={a.id} {...a} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Insights */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Actionable Insights</h3>
              <button className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md transition-all duration-300 shadow-md">
                Start Focus Mode
              </button>
            </div>
            <ul className="mt-4 list-disc pl-5 text-slate-300 space-y-2">
              <li>Practice timed quizzes twice a week to improve speed.</li>
              <li>Review incorrectly solved problems from the last 2 weeks.</li>
              <li>Join peer study group for topic: Statistics.</li>
            </ul>
          </motion.section>
        </motion.main>
      </motion.div>
    </div>
  );
}