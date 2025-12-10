// src/components/AvailabilitySelector.jsx
import { useState } from "react";

export default function AvailabilitySelector({ faculty, onSave }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const [grid, setGrid] = useState(
    days.map(() => periods.map(() => true))
  );

  const toggle = (d, p) => {
    const newGrid = [...grid];
    newGrid[d][p] = !newGrid[d][p];
    setGrid(newGrid);
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-semibold mb-3">
        Set Availability – {faculty.name}
      </h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th></th>
            {periods.map((p) => (
              <th key={p} className="border p-1">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, d) => (
            <tr key={day}>
              <td className="border p-1">{day}</td>
              {periods.map((p, pi) => (
                <td
                  key={pi}
                  onClick={() => toggle(d, pi)}
                  className={
                    "border p-2 cursor-pointer " +
                    (grid[d][pi] ? "bg-green-200" : "bg-red-300")
                  }
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onSave(grid)}
      >
        Save Availability
      </button>
    </div>
  );
}
