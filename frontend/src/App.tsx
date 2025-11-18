import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage";
import NotesPage from "./pages/NotesPage";
import PrivateRoute from "./utils/PrivateRoute";
import AIStudyCompanion from './pages/AIStudyCompanion'
import Quiz from './pages/Quiz'
import QuizPage from "./pages/QuizPage";
import Result from "./pages/Result";
import AIRevisionEng from "./pages/AIRevisionEng";
import AIChartPage from "./pages/AIChartPage";
import PerformancePage from "./pages/PerfoemancePage";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Student routes */}
      <Route
        path="/student"
        element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/notes"
        element={
          <PrivateRoute>
            <NotesPage />
          </PrivateRoute>
        }
      />

      {/* ✅ Instructor routes */}
      <Route
        path="/instructor"
        element={
          <PrivateRoute>
            <InstructorDashboard />
          </PrivateRoute>
        }
      />

      {/* ✅ Knowledge Graph route */}
      <Route
        path="/knowledge-graph"
        element={
          <PrivateRoute>
            <KnowledgeGraphPage />
          </PrivateRoute>
        }
      />

      <Route
        path="student/study-companion"
        element={
          <PrivateRoute>
            <AIStudyCompanion />
          </PrivateRoute>
        }
      />

      <Route
        path="student/ai-quiz"
        element={
          <PrivateRoute>
            <Quiz />
          </PrivateRoute>
        }
      />
      <Route
        path="/QUIZTEST"
        element={
          <PrivateRoute>
            <QuizPage />
          </PrivateRoute>
        }
      />


      <Route
        path="/result"
        element={
          <PrivateRoute>
            <Result />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/notes"
        element={
          <PrivateRoute>
            <NotesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/CEEAly/performance"
        element={
          <PrivateRoute>
            <PerformancePage />

          </PrivateRoute>
        }
      />
      <Route
        path="/CEEAly/chart"
        element={
          <PrivateRoute>
            <AIChartPage />

          </PrivateRoute>
        }
      />
      <Route
        path="/student/revision"
        element={
          <PrivateRoute>
            <AIRevisionEng />
          </PrivateRoute>
        }
      />

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
