// src/pages/PerformancePage.tsx
import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout"; // your layout that uses sidebar
import { fetchStudents } from "../lib/api";

export default function PerformancePage() {
  const [module, setModule] = useState("");
  const [scoreMin, setScoreMin] = useState<number | "">("");
  const [school, setSchool] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    try {
      const data = await fetchStudents({
        module: module || undefined,
        score_min: scoreMin === "" ? undefined : scoreMin,
        school: school || undefined,
        limit: 50
      });
      console.log(data);
      
      setResults(data.students || []);
    } catch (err) {
      console.error(err);
      alert("Search failed: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout role="student">
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-indigo-300">Student Performance</h1>

        <div className="mt-4 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-sm text-gray-300">Module</label>
              <input value={module} onChange={(e)=>setModule(e.target.value)} className="px-3 py-2 rounded bg-white/5"/>
            </div>
            <div>
              <label className="text-sm text-gray-300">Score ≥</label>
              <input type="number" value={scoreMin} onChange={(e)=> setScoreMin(e.target.value===""? "": Number(e.target.value)) } className="px-3 py-2 rounded bg-white/5"/>
            </div>
            <div>
              <label className="text-sm text-gray-300">School</label>
              <input value={school} onChange={(e)=> setSchool(e.target.value)} className="px-3 py-2 rounded bg-white/5"/>
            </div>
            <button disabled={loading} onClick={handleSearch} className="ml-auto px-4 py-2 bg-indigo-600 rounded"> {loading? "Searching..." : "Search"} </button>
          </div>

          <div className="mt-4">
            {results.length === 0 ? <p className="text-gray-400">No results</p> :
              <table className="w-full text-sm">
                <thead className="text-indigo-300">
                  <tr><th>Name</th><th>School</th><th>Score</th><th>Completed %</th><th>Email</th></tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="py-2">{r.name}</td>
                      <td>{r.school}</td>
                      <td>{r.eco_score}</td>
                      <td>{r.module_completion_pct}%</td>
                      <td>{r.primary_email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
