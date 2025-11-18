import React from "react";

export default function ActivityItem({ title, time, result }: { title: string; time: string; result: string; }): JSX.Element {
  return (
    <div className="flex items-center justify-between bg-white/3 p-3 rounded-lg">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-300 mt-1">{time}</div>
      </div>
      <div className="text-sm text-slate-50">{result}</div>
    </div>
  );
}
