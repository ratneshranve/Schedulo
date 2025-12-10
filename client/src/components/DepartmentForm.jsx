import { useState } from "react";
import { api } from "../api";

export default function DepartmentForm({ onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    code: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await api.createDepartment(formData);
      alert("Department created!");
      setFormData({ name: "", code: "" });
      if (onCreated) onCreated();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Create Department</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Department Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="code"
          placeholder="Department Code"
          value={formData.code}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
