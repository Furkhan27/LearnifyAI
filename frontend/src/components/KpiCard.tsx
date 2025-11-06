import React from "react";

type KpiCardProps = {
  title: string;
  value: string;
  trend?: string;
};

export default function KpiCard({ title, value, trend }: KpiCardProps) {
  return (
    <div className="min-w-[170px] p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="text-xs text-slate-300">{title}</div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-semibold text-white">{value}</div>
        {trend && (
          <div
            className={`text-sm ${
              trend.startsWith("+") ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
