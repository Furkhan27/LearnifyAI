import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // 👁️ Icons

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      toast.success("Signup successful 🎉 Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ Signup Error:", error);
      toast.error("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white font-poppins overflow-hidden">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[400px] bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
      >
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-center mb-2 text-white drop-shadow"
        >
          Create Account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-center text-gray-300 mb-8"
        >
          Join LearnifyAI and start your personalized learning journey 🚀
        </motion.p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Full Name"
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password field */}
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full transition-all"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3 text-slate-300 hover:text-white transition-transform hover:scale-110"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 👇 Glassmorphic Dropdown */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <select
              className="appearance-none px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full transition-all cursor-pointer shadow-md hover:bg-white/20"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student" className="text-black bg-white">
                Student
              </option>
              <option value="instructor" className="text-black bg-white">
                Instructor
              </option>
            </select>

            {/* Down Arrow (pure CSS icon) */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-300">
              ▼
            </div>
          </motion.div>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: !isLoading ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            type="submit"
            className={`${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            } text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg`}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-300 text-center mt-6"
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-400 cursor-pointer hover:underline hover:text-indigo-300 transition-all"
          >
            Login here
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-400 text-center mt-8"
        >
          © LearnifyAI 2025 — Secure & Smart Learning
        </motion.p>
      </motion.div>

      {/* Subtle loader text at bottom */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-10 text-indigo-300 text-sm animate-pulse"
        >
          Creating your account...
        </motion.div>
      )}
    </div>
  );
};

export default Register;
