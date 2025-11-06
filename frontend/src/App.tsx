import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import PrivateRoute from './utils/PrivateRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
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

      {/* 404 Fallback */}
      <Route path="*" element={<div className="text-center p-8">Page not found</div>} />
    </Routes>
  );
};

export default App;
