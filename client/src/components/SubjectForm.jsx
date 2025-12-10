// src/components/SubjectForm.jsx
import { useState, useEffect } from "react";
import { api } from "../api";

export default function SubjectForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "lecture",
    sessionsPerWeek: 3,
    labSizePeriods: 2,
    faculty: null
  });
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    api.getFaculty().then(setFaculties).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addSubject(form);
      setForm({
        name: "",
        code: "",
        type: "lecture",
        sessionsPerWeek: 3,
        labSizePeriods: 2,
        faculty: null
      });
      onCreated?.();
    } catch (err) {
      alert("Error creating subject: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Create Subject</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Subject Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Subject Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="lecture">Lecture</option>
          <option value="lab">Lab</option>
        </select>
        <input
          type="number"
          placeholder="Sessions per Week"
          value={form.sessionsPerWeek}
          onChange={(e) => setForm({ ...form, sessionsPerWeek: parseInt(e.target.value) })}
          min="1"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {form.type === "lab" && (
          <input
            type="number"
            placeholder="Lab Size (periods)"
            value={form.labSizePeriods}
            onChange={(e) => setForm({ ...form, labSizePeriods: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        )}
        <select
          value={form.faculty || ""}
          onChange={(e) => setForm({ ...form, faculty: e.target.value || null })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Assign Faculty (optional) --</option>
          {faculties.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name}
            </option>
          ))}
        </select>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Add Subject
        </button>
      </form>
    </div>
  );
}
