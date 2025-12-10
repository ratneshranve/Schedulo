// src/api.js - Centralized API calls
const API_BASE = "http://localhost:3001/api";

export const api = {
  // Departments
  getDepartments: () => fetch(`${API_BASE}/departments`).then(handleResponse),
  createDepartment: (data) =>
    fetch(`${API_BASE}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateDepartment: (id, data) =>
    fetch(`${API_BASE}/departments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteDepartment: (id) =>
    fetch(`${API_BASE}/departments/${id}`, { method: "DELETE" }).then(handleResponse),

  // Faculty
  getFaculty: () => fetch(`${API_BASE}/faculty`).then(handleResponse),
  addFaculty: (data) =>
    fetch(`${API_BASE}/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateFaculty: (id, data) =>
    fetch(`${API_BASE}/faculty/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteFaculty: (id) =>
    fetch(`${API_BASE}/faculty/${id}`, { method: "DELETE" }).then(handleResponse),

  // Subjects
  getSubjects: () => fetch(`${API_BASE}/subjects`).then(handleResponse),
  addSubject: (data) =>
    fetch(`${API_BASE}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateSubject: (id, data) =>
    fetch(`${API_BASE}/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteSubject: (id) =>
    fetch(`${API_BASE}/subjects/${id}`, { method: "DELETE" }).then(handleResponse),

  // Classes
  getClasses: () => fetch(`${API_BASE}/classes`).then(handleResponse),
  addClass: (data) =>
    fetch(`${API_BASE}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateClass: (id, data) =>
    fetch(`${API_BASE}/classes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteClass: (id) =>
    fetch(`${API_BASE}/classes/${id}`, { method: "DELETE" }).then(handleResponse),

  // Rooms
  getRooms: () => fetch(`${API_BASE}/rooms`).then(handleResponse),
  addRoom: (data) =>
    fetch(`${API_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  updateRoom: (id, data) =>
    fetch(`${API_BASE}/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),
  deleteRoom: (id) =>
    fetch(`${API_BASE}/rooms/${id}`, { method: "DELETE" }).then(handleResponse),

  // Config
  getConfig: () => fetch(`${API_BASE}/config`).then(handleResponse),
  updateConfig: (data) =>
    fetch(`${API_BASE}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(handleResponse),

  // Timetable
  generateAll: (config) =>
    fetch(`${API_BASE}/timetable/generate-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config || {})
    }).then(handleResponse),
  getTimetableForClass: (id) =>
    fetch(`${API_BASE}/timetable/class/${id}`).then(handleResponse),
  getTimetableForFaculty: (id) =>
    fetch(`${API_BASE}/timetable/faculty/${id}`).then(handleResponse),
  getAllTimetables: () => fetch(`${API_BASE}/timetable/all`).then(handleResponse),

  // Diagnostic
  getDataSummary: () => fetch(`${API_BASE}/diagnostic/data-summary`).then(handleResponse)
};

async function handleResponse(res) {
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error(`Server returned ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (!res.ok) {
    // Ensure error object has string properties
    const errorObj = {
      error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Unknown error'),
      success: data.success || false,
      diagnostics: data.diagnostics || null
    };
    throw errorObj;
  }
  return data;
}
