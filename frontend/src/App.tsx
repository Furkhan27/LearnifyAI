import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage"; // ✅ Use this one
import PrivateRoute from "./utils/PrivateRoute";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Protected (Private) Routes */}
      <Route
        path="/student"
        element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/instructor"
        element={
          <PrivateRoute>
            <InstructorDashboard />
          </PrivateRoute>
        }
      />

      {/* ✅ Knowledge Graph route with Sidebar */}
      <Route
        path="/knowledge-graph"
        element={
          <PrivateRoute>
            <KnowledgeGraphPage />
          </PrivateRoute>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="text-center p-8 text-white bg-slate-900 min-h-screen">
            <h2 className="text-2xl font-bold mb-2">404 — Page Not Found</h2>
            <p className="text-gray-400">
              The page you’re looking for doesn’t exist.
            </p>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
