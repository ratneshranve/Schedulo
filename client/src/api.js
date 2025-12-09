// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export const getClasses = () => request("/classes", { method: "GET" });
export const getFaculty = () => request("/faculty", { method: "GET" });
export const getSubjects = () => request("/subjects", { method: "GET" });

export const fetchTimetableForClass = (classId) =>
  request(`/timetable/class/${classId}`, { method: "GET" });

// trigger global timetable generation
// Body optional: { days: [...], periodsPerDay: 8 }
export const generateAllTimetables = (body = {}) =>
  request(`/timetable/generate-all`, { method: "POST", body: JSON.stringify(body) });
