import React from "react";

export default function SkillBar({ name, pct }: { name: string; pct: number; }): JSX.Element {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <div className="text-sm">{name}</div>
        <div className="text-xs text-slate-300">{pct}%</div>
      </div>

      <div className="w-full h-3 bg-white/6 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
