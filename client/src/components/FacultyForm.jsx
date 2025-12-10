// src/components/FacultyForm.jsx
import { useState } from "react";
import { api } from "../api";

export default function FacultyForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    maxLoadPerDay: 4,
    maxLoadPerWeek: 20,
    availability: {
      Mon: [1, 2, 3, 4, 5, 6, 7, 8],
      Tue: [1, 2, 3, 4, 5, 6, 7, 8],
      Wed: [1, 2, 3, 4, 5, 6, 7, 8],
      Thu: [1, 2, 3, 4, 5, 6, 7, 8],
      Fri: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  });
  const [showAvail, setShowAvail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addFaculty(form);
      setForm({
        name: "",
        shortName: "",
        maxLoadPerDay: 4,
        maxLoadPerWeek: 20,
        availability: {
          Mon: [1, 2, 3, 4, 5, 6, 7, 8],
          Tue: [1, 2, 3, 4, 5, 6, 7, 8],
          Wed: [1, 2, 3, 4, 5, 6, 7, 8],
          Thu: [1, 2, 3, 4, 5, 6, 7, 8],
          Fri: [1, 2, 3, 4, 5, 6, 7, 8]
        }
      });
      onCreated?.();
    } catch (err) {
      alert("Error creating faculty: " + (err.message || JSON.stringify(err)));
    }
  };

  const togglePeriod = (day, period) => {
    setForm({
      ...form,
      availability: {
        ...form.availability,
        [day]: form.availability[day].includes(period)
          ? form.availability[day].filter(p => p !== period)
          : [...form.availability[day], period].sort((a, b) => a - b)
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Create Faculty</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Short Name"
          value={form.shortName}
          onChange={(e) => setForm({ ...form, shortName: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Max per Day"
            value={form.maxLoadPerDay}
            onChange={(e) => setForm({ ...form, maxLoadPerDay: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Max per Week"
            value={form.maxLoadPerWeek}
            onChange={(e) => setForm({ ...form, maxLoadPerWeek: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAvail(!showAvail)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showAvail ? "Hide" : "Edit"} Availability
        </button>
        {showAvail && (
          <div className="border border-gray-300 p-3 rounded bg-gray-50 text-sm">
            <p className="font-semibold mb-2">Click periods to toggle availability:</p>
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <div key={day} className="mb-2">
                <strong>{day}:</strong>
                <div className="flex gap-1 flex-wrap mt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePeriod(day, p)}
                      className={`w-8 h-8 border rounded ${
                        form.availability[day].includes(p)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add Faculty
        </button>
      </form>
    </div>
  );
}
