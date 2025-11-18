import React, { useState, ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserAlt, FaLock, FaEnvelope, FaUserGraduate } from "react-icons/fa";
import { loginUser, registerUser } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    stream: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        if (res.message === "Login successful") {
          toast.success("Welcome back 👋");
          localStorage.setItem("token", res.token);
          localStorage.setItem("role", res.user?.role || "");
          setTimeout(() => {
            navigate("/dashboard");
          }, 600);
        } else {
          toast.error(res.message || "Invalid credentials");
        }
      } else {
        const res = await registerUser(formData);

        if (res.message === "User registered successfully") {
  toast.success("Registration successful! 🎉");
  setLoading(false);
  // Switch immediately (no 1s delay)
  setTimeout(() => setIsLogin(true), 400);
} else {
  toast.error(res.message || "Something went wrong");
}

      }
    } catch {
      toast.error("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-10 w-[400px] transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-cyan-300">
              {isLogin ? "Welcome Back 👋" : "Join LearnifyAI 🚀"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Name input */}
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-300">
                      {FaUserAlt({}) as ReactElement}
                    </span>
                    <input
                      autoComplete="off"
                      name="name"
                      placeholder="Full Name"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full pl-10 p-3 bg-white/20 rounded-lg focus:outline-none text-white placeholder-gray-300"
                    />
                  </div>

                  {/* Role input */}
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-300">
                      {FaUserGraduate({}) as ReactElement}
                    </span>
                    <input
                      autoComplete="off"
                      name="role"
                      placeholder="Role (Student/Instructor)"
                      onChange={handleChange}
                      value={formData.role}
                      className="w-full pl-10 p-3 bg-white/20 rounded-lg focus:outline-none text-white placeholder-gray-300"
                    />
                  </div>

                  {/* Stream input */}
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-300">
                      {FaUserGraduate({}) as ReactElement}
                    </span>
                    <input
                      autoComplete="off"
                      name="stream"
                      placeholder="Stream (e.g. Computer Science)"
                      onChange={handleChange}
                      value={formData.stream}
                      className="w-full pl-10 p-3 bg-white/20 rounded-lg focus:outline-none text-white placeholder-gray-300"
                    />
                  </div>
                </>
              )}

              {/* Email input */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-300">
                  {FaEnvelope({}) as ReactElement}
                </span>
                <input
                  autoComplete="off"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={formData.email}
                  className="w-full pl-10 p-3 bg-white/20 rounded-lg focus:outline-none text-white placeholder-gray-300"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-300">
                  {FaLock({}) as ReactElement}
                </span>
                <input
                  autoComplete="new-password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full pl-10 p-3 bg-white/20 rounded-lg focus:outline-none text-white placeholder-gray-300"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <motion.div
                    className="flex justify-center"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      ease: "linear",
                      duration: 0.6,
                    }}
                  >
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  </motion.div>
                ) : (
                  <>{isLogin ? "Login" : "Sign Up"}</>
                )}
              </button>
            </form>

            {/* Toggle form */}
            <p className="text-center mt-6 text-gray-300">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <span
                className="text-cyan-300 cursor-pointer font-semibold hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create one" : "Login"}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthForm;
export {};
