import React, { useState } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  role: "student" | "instructor";
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0b0f19] via-[#101828] to-[#1e293b] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar role={role} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content shifts dynamically */}
      <main
        className={`flex-1 transition-all duration-500 ease-in-out ${
          isCollapsed ? "ml-[80px]" : "ml-[260px]"
        } p-6 overflow-y-auto`}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
