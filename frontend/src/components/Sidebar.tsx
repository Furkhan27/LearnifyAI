import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Lightbulb,
  GraduationCap,
  Bot,
  Repeat,
  NotebookPen,
  Settings,
  LogOut,
  Users,
  Eye,
  ClipboardList,
  Menu,
  X,
  FileText
} from "lucide-react";

// ✅ Sidebar Props now accept collapse control from parent
interface SidebarProps {
  role: "student" | "instructor";
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Student & Instructor Link Sets
  const studentLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student" },
    { name: "Notes", icon: FileText, path: "/student/notes" },
    { name: "Knowledge Graph", icon: Brain, path: "/knowledge-graph" },
    { name: "AI Quiz Generator", icon: ClipboardList, path: "/student/ai-quiz" },
    { name: "CEEAly", icon: Lightbulb, path: "/student/ceealy" },
    { name: "AI Study Companion", icon: Bot, path: "/student/study-companion" },
    { name: "Smart Revision Engine", icon: Repeat, path: "/student/revision" },
    { name: "Progress Journal", icon: NotebookPen, path: "/student/journal" },
    { name: "Settings", icon: Settings, path: "/student/settings" },
  ];

  const instructorLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/instructor" },
    { name: "Manage Courses", icon: BookOpen, path: "/instructor/manage-courses" },
    { name: "Vision AI", icon: Eye, path: "/instructor/vision-ai" },
    { name: "Student Insights", icon: Users, path: "/instructor/insights" },
    { name: "AI Assessment Tools", icon: ClipboardList, path: "/instructor/assessments" },
    { name: "Settings", icon: Settings, path: "/instructor/settings" },
  ];

  const links = role === "student" ? studentLinks : instructorLinks;

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ width: "260px" }}
      animate={{
        width: isCollapsed ? "80px" : "260px",
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="h-screen bg-white/10 backdrop-blur-2xl border-r border-white/20 text-white fixed left-0 top-0 flex flex-col justify-between shadow-xl overflow-hidden z-50"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              navigate(role === "student" ? "/student" : "/instructor")
            }
          >
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-md">
              <GraduationCap size={22} />
            </div>

            {/* Sidebar Title (hidden when collapsed) */}
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-semibold tracking-wide text-indigo-400"
              >
                LearnifyAI
              </motion.h1>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-300 hover:text-indigo-400 transition"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 px-3 overflow-y-auto scrollbar-none flex-1">
          {links.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <motion.div
                key={name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                className={`my-1 flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600/80 text-white shadow-md"
                    : "hover:bg-white/10 text-gray-300"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap font-medium">{name}</span>
                )}
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-white/10 p-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-500 text-white py-2 rounded-lg transition-all"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;