import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function ProgressChart({ data }: { data: Array<any>; }): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
        <XAxis dataKey="week" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip wrapperStyle={{ background: "#0b1220", borderRadius: 8 }} contentStyle={{ color: "#fff" }} />
        <Legend wrapperStyle={{ color: "#cbd5e1" }} />
        <Line type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2} dot />
        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
