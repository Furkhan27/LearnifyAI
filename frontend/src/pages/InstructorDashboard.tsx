import KpiCard from "../components/KpiCard";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  Menu,
  User,
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function InstructorDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [instructorName, setInstructorName] = useState("Instructor");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user?.name) setInstructorName(user.name.split(" ")[0]);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarItems = [
    { icon: BarChart3, label: "Dashboard" },
    { icon: BookOpen, label: "Manage Courses" },
    { icon: ClipboardList, label: "Assignments" },
    { icon: Brain, label: "AI Insights" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="grid grid-cols-[auto,1fr] min-h-screen bg-gradient-to-b from-[#060c1a] via-[#0b1220] to-[#0b1626] text-slate-100 font-poppins">
      <Toaster position="top-center" />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 88 : 240 }}
        transition={{ duration: 0.3 }}
        className="h-screen bg-white/10 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shadow-2xl sticky top-0"
      >
        {/* Top Section */}
        <div>
          <div
            className="flex items-center justify-between px-4 py-4 border-b border-white/10 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-lg text-white shadow-md">
                L
              </div>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-lg font-semibold text-white">
                    LearnifyAI
                  </h1>
                  <p className="text-xs text-slate-300 -mt-1">
                    Instructor Panel
                  </p>
                </motion.div>
              )}
            </div>
            {!collapsed && (
              <Menu size={18} className="text-slate-300 hover:text-white" />
            )}
          </div>

          {/* Sidebar buttons */}
          <nav className="mt-4 space-y-1">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.03 }}
                className={`w-full flex items-center gap-3 ${
                  collapsed ? "justify-center" : "px-5"
                } py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300`}
                onClick={() => console.log(`${item.label} clicked`)}
              >
                <item.icon size={20} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className={`m-4 mb-6 flex items-center ${
            collapsed ? "justify-center" : "justify-center gap-2"
          } bg-white/10 hover:bg-white/20 border border-white/10 text-white py-2 rounded-lg transition-all duration-300`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </motion.button>
      </motion.aside>

      {/* Main Area */}
      <motion.div layout className="flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 py-3 shadow-lg">
          <h2 className="text-xl font-semibold text-white">
            Welcome, <span className="text-indigo-400">{instructorName}</span> 👋
          </h2>
          <button
            className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-slate-200 hover:bg-white/20 transition-all duration-300"
            onClick={() => console.log("Profile clicked")}
          >
            <User size={18} className="text-indigo-300" />
            <span className="text-sm hidden sm:block">{instructorName}</span>
          </button>
        </header>

        {/* Scrollable main content */}
        <motion.main layout className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* KPI Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KpiCard title="Total Students" value="124" trend="+6%" />
            <KpiCard title="Avg Performance" value="78%" trend="+3%" />
            <KpiCard title="Pending Reviews" value="12" />
          </div>

          {/* Top Performing Students */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Top Performing Students
              </h3>
              <button className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md transition-all duration-300">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Ayesha Khan", score: 92 },
                { name: "Rahul Verma", score: 89 },
                { name: "Sarah Lee", score: 87 },
              ].map((student, idx) => (
                <motion.div
                  key={student.name}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/10 p-4 rounded-xl border border-white/10 text-center shadow-md hover:bg-white/15 transition"
                >
                  <div className="text-indigo-400 font-semibold text-lg">
                    #{idx + 1}
                  </div>
                  <h4 className="text-white font-medium mt-1">
                    {student.name}
                  </h4>
                  <p className="text-sm text-slate-300">
                    Performance: {student.score}%
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Recent Submissions */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-3 text-white">
              Recent Submissions
            </h3>
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Assignment</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Ankit Singh", task: "AI Basics", score: "88%", status: "Reviewed" },
                  { name: "Riya Sharma", task: "Data Mining", score: "Pending", status: "Awaiting" },
                  { name: "Kabir Das", task: "ML Project", score: "90%", status: "Reviewed" },
                ].map((row) => (
                  <tr
                    key={row.name}
                    className="hover:bg-white/10 transition rounded-md"
                  >
                    <td className="py-2">{row.name}</td>
                    <td>{row.task}</td>
                    <td>{row.score}</td>
                    <td
                      className={`${
                        row.status === "Reviewed"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.section>

          {/* AI Insights */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                AI Insights for Teaching
              </h3>
              <Brain size={22} className="text-indigo-400" />
            </div>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>
                Students show strong engagement in visual learning modules.
              </li>
              <li>
                Time spent on “Advanced ML” topics dropped by 18% this week.
              </li>
              <li>
                AI suggests adding a mini-project for reinforcement.
              </li>
            </ul>
          </motion.section>

          {/* Action Center */}
          <motion.section
            layout
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Instructor Action Center
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Create Course", icon: PlusCircle },
                { label: "Grade Submissions", icon: ClipboardList },
                { label: "Generate AI Report", icon: Brain },
              ].map((a) => (
                <motion.button
                  key={a.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => console.log(`${a.label} clicked`)}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-medium transition-all duration-300 shadow-md text-white"
                >
                  <a.icon size={18} />
                  {a.label}
                </motion.button>
              ))}
            </div>
          </motion.section>
        </motion.main>
      </motion.div>
    </div>
  );
}
