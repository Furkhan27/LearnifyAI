import React from "react";
import AuthForm from "../components/AuthForm";
import { motion } from "framer-motion";

const AuthPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-cyan-800 overflow-hidden"
    >
      {/* Moving glow lights */}
      <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[160px] top-[-200px] left-[-200px] animate-pulse" />
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[180px] bottom-[-200px] right-[-150px] animate-pulse" />

      <AuthForm />
    </motion.div>
  );
};

export default AuthPage;
export {};
