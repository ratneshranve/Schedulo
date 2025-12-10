import { useState } from "react";
import { api } from "../api";

export default function RoomForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    type: "classroom",
    capacity: 30
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addRoom(form);
      setForm({ name: "", type: "classroom", capacity: 30 });
      onCreated?.();
    } catch (err) {
      alert("Error creating room: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Create Room</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Room Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="classroom">Classroom</option>
          <option value="lab">Lab</option>
        </select>
        <input
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
          min="1"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Add Room
        </button>
      </form>
    </div>
  );
}
