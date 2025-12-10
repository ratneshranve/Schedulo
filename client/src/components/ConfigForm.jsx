import { useState } from "react";
import { api } from "../api";

export default function ConfigForm({ onCreated }) {
  const [formData, setFormData] = useState({
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    periodsPerDay: 8,
    periodDuration: 50,
    instituteStartTime: "09:00",
    instituteEndTime: "17:00",
    breaks: [
      { name: "Recess", afterPeriod: 2, duration: 15, startTime: "10:50" },
      { name: "Lunch", afterPeriod: 4, duration: 30, startTime: "12:30" }
    ],
    labAllowedStarts: [1, 3, 5, 7],
    maxConsecutivePeriodsForFaculty: 3
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("break_")) {
      const [_, index, field] = name.split("_");
      const breaks = [...formData.breaks];
      breaks[index][field] = isNaN(value) ? value : parseInt(value);
      setFormData({ ...formData, breaks });
    } else if (name === "labAllowedStarts") {
      setFormData({
        ...formData,
        labAllowedStarts: value.split(",").map(Number)
      });
    } else if (name === "workingDays") {
      setFormData({
        ...formData,
        workingDays: value.split(",").map(s => s.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: isNaN(value) ? value : parseInt(value)
      });
    }
  };

  const addBreak = () => {
    setFormData({
      ...formData,
      breaks: [
        ...formData.breaks,
        { name: "Break", afterPeriod: 3, duration: 15, startTime: "00:00" }
      ]
    });
  };

  const removeBreak = (index) => {
    setFormData({
      ...formData,
      breaks: formData.breaks.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateConfig(formData);
      alert("Configuration saved!");
      if (onCreated) onCreated();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">System Configuration</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Periods Per Day</label>
            <input
              type="number"
              name="periodsPerDay"
              value={formData.periodsPerDay}
              onChange={handleChange}
              min="4"
              max="12"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Period Duration (min)</label>
            <input
              type="number"
              name="periodDuration"
              value={formData.periodDuration}
              onChange={handleChange}
              min="30"
              max="120"
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Institute Start Time</label>
            <input
              type="time"
              name="instituteStartTime"
              value={formData.instituteStartTime}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Institute End Time</label>
            <input
              type="time"
              name="instituteEndTime"
              value={formData.instituteEndTime}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Max Consecutive Periods for Faculty</label>
          <input
            type="number"
            name="maxConsecutivePeriodsForFaculty"
            value={formData.maxConsecutivePeriodsForFaculty}
            onChange={handleChange}
            min="1"
            max="8"
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Lab Allowed Start Periods (comma-separated)</label>
          <input
            type="text"
            name="labAllowedStarts"
            value={formData.labAllowedStarts.join(", ")}
            onChange={handleChange}
            placeholder="1, 3, 5, 7"
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Breaks */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Breaks & Lunch</h4>
          {formData.breaks.map((brk, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded mb-2 grid grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={brk.name}
                onChange={(e) => {
                  const breaks = [...formData.breaks];
                  breaks[idx].name = e.target.value;
                  setFormData({ ...formData, breaks });
                }}
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="After Period"
                value={brk.afterPeriod}
                onChange={(e) => {
                  const breaks = [...formData.breaks];
                  breaks[idx].afterPeriod = parseInt(e.target.value);
                  setFormData({ ...formData, breaks });
                }}
                min="1"
                max="12"
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Duration (min)"
                value={brk.duration}
                onChange={(e) => {
                  const breaks = [...formData.breaks];
                  breaks[idx].duration = parseInt(e.target.value);
                  setFormData({ ...formData, breaks });
                }}
                min="5"
                max="60"
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="time"
                value={brk.startTime}
                onChange={(e) => {
                  const breaks = [...formData.breaks];
                  breaks[idx].startTime = e.target.value;
                  setFormData({ ...formData, breaks });
                }}
                className="border rounded px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeBreak(idx)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBreak}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm mt-2 hover:bg-green-700"
          >
            + Add Break
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Configuration"}
        </button>
      </form>
    </div>
  );
}
