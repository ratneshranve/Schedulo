// src/components/FacultyForm.jsx
import { useState } from "react";
import { api } from "../api";

export default function FacultyForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    weeklyLoadLimit: 20,
    maxPeriodsPerDay: 6,
    availability: {
      Mon: [1, 2, 3, 4, 5, 6, 7, 8],
      Tue: [1, 2, 3, 4, 5, 6, 7, 8],
      Wed: [1, 2, 3, 4, 5, 6, 7, 8],
      Thu: [1, 2, 3, 4, 5, 6, 7, 8],
      Fri: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  });
  const [showAvail, setShowAvail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert("Faculty name is required");
      return;
    }
    setLoading(true);
    try {
      // Only send non-empty department
      const dataToSend = { ...form };
      if (!dataToSend.department) {
        delete dataToSend.department;
      }
      if (!dataToSend.email) {
        delete dataToSend.email;
      }
      await api.addFaculty(dataToSend);
      setForm({
        name: "",
        email: "",
        department: "",
        weeklyLoadLimit: 20,
        maxPeriodsPerDay: 6,
        availability: {
          Mon: [1, 2, 3, 4, 5, 6, 7, 8],
          Tue: [1, 2, 3, 4, 5, 6, 7, 8],
          Wed: [1, 2, 3, 4, 5, 6, 7, 8],
          Thu: [1, 2, 3, 4, 5, 6, 7, 8],
          Fri: [1, 2, 3, 4, 5, 6, 7, 8]
        }
      });
      alert("Faculty created successfully!");
      if (onCreated) onCreated();
    } catch (err) {
      alert("Error creating faculty: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
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
          name="name"
          placeholder="Full Name *"
          value={form.name}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="weeklyLoadLimit"
            placeholder="Weekly Load Limit"
            value={form.weeklyLoadLimit}
            onChange={handleInputChange}
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            type="number"
            name="maxPeriodsPerDay"
            placeholder="Max Periods/Day"
            value={form.maxPeriodsPerDay}
            onChange={handleInputChange}
            min="1"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAvail(!showAvail)}
          className="text-sm text-blue-600 hover:underline font-semibold"
        >
          {showAvail ? "▼ Hide" : "▶ Edit"} Availability
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
                      className={`w-8 h-8 border rounded text-xs font-bold transition ${
                        form.availability[day].includes(p)
                          ? "bg-green-500 text-white border-green-600"
                          : "bg-gray-200 border-gray-400 hover:bg-gray-300"
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
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 text-sm">
          {loading ? "Creating..." : "Create Faculty"}
        </button>
      </form>
    </div>
  );
}

