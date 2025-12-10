// src/components/ClassForm.jsx
import { useState, useEffect } from "react";
import { api } from "../api";

export default function ClassForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    year: 1,
    section: "A",
    subjects: []
  });
  const [allSubjects, setAllSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.getSubjects().then(setAllSubjects).catch(console.error);
    api.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const toggleSubject = (id) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(id)
        ? prev.subjects.filter((s) => s !== id)
        : [...prev.subjects, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addClass(form);
      setForm({
        name: "",
        department: "",
        year: 1,
        section: "A",
        subjects: []
      });
      onCreated?.();
    } catch (err) {
      alert("Error creating class: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Create Class</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Class Name (e.g., CSE-2A)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Select Department --</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.year}
            onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value={1}>Year 1</option>
            <option value={2}>Year 2</option>
            <option value={3}>Year 3</option>
            <option value={4}>Year 4</option>
          </select>
          <input
            type="text"
            placeholder="Section (A, B, C...)"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-2">Assign Subjects:</h3>
          <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-40 overflow-y-auto">
            {allSubjects.length === 0 ? (
              <p className="text-sm text-gray-500">No subjects created yet</p>
            ) : (
              allSubjects.map((s) => (
                <label key={s._id} className="flex items-center space-x-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.subjects.includes(s._id)}
                    onChange={() => toggleSubject(s._id)}
                  />
                  <span className="text-sm">
                    {s.name} <span className="text-gray-500">({s.type})</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Create Class
        </button>
      </form>
    </div>
  );
}
