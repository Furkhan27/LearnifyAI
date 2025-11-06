import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Student";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-800 flex flex-col items-center justify-center text-white"
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to LearnifyAI 🎓</h1>
      <p className="text-lg text-gray-300 mb-8">
        You are logged in as <span className="font-semibold">{role}</span>
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold text-white transition"
      >
        Logout
      </button>
    </motion.div>
  );
};

export default Dashboard;
export {};
