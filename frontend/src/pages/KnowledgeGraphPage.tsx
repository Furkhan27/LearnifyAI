import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import KnowledgeGraph from "./KnowledgeGraph";

export default function KnowledgeGraphPage() {
  return (
    <DashboardLayout role="student">
      <KnowledgeGraph />
    </DashboardLayout>
  );
}
