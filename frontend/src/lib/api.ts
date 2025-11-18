// src/lib/api.ts

// Base URL for backend — comes from your frontend .env file
const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");

/**
 * Generic function to fetch students from FastAPI backend
 * You can reuse this helper for any other API later.
 */
export async function fetchStudents(params: Record<string, string | number | undefined>) {
  const url = new URL(`http://localhost:8000/api/students`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
