import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // ✅ Added import for icons

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log(data);
      

      if (!response.ok) {
        toast.error(data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // ✅ Store user info before navigating
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("UserID", JSON.stringify(data.user?.id));

      toast.success("Login successful 🎉");

      // ✅ Use a guaranteed redirect with delay (for toast + animation)
      setTimeout(() => {
        const role = data.user?.role?.toLowerCase();
        if (role === "student") {
          navigate("/student", { replace: true });
        } else if (role === "instructor") {
          navigate("/instructor", { replace: true });
        } else {
          navigate("/student", { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Server error. Please try again later.");
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
        className="w-[380px] bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
      >
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold text-center mb-2 text-white drop-shadow"
        >
          Welcome Back
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-center text-gray-300 mb-8"
        >
          Login to your LearnifyAI account
        </motion.p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Email"
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full transition-all"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-3 text-slate-300 hover:text-white transition-transform hover:scale-110"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: !isLoading ? 1.05 : 1 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            type="submit"
            className={`${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            } text-white py-3 rounded-lg font-semibold transition-all duration-300`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-300 text-center mt-6"
        >
          New here?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-400 cursor-pointer hover:underline hover:text-indigo-300 transition-all"
          >
            Create one
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

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-10 text-indigo-300 text-sm animate-pulse"
        >
          Authenticating...
        </motion.div>
      )}
    </div>
  );
};

export default Login;
