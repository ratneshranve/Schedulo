import { useState, useEffect } from "react";
import { api } from "../api";

export default function TimetableGrid({ classId }) {
  const [tt, setTt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getTimetableForClass(classId)
      .then(setTt)
      .catch((err) => {
        console.error("Error fetching timetable:", err);
        setTt(null);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (!tt) return <div className="text-center py-4 text-red-600">No timetable generated yet</div>;

  const days = tt.periods && tt.periods.length > 0
    ? [...new Set(tt.periods.map((p) => p.day))]
    : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const maxPeriods = 8;

  // Build grid: grid[day][period] = period object or null
  const grid = {};
  days.forEach((day) => {
    grid[day] = {};
    for (let i = 0; i < maxPeriods; i++) {
      grid[day][i] = null;
    }
  });

  if (tt.periods) {
    tt.periods.forEach((p) => {
      grid[p.day] = grid[p.day] || {};
      grid[p.day][p.periodIndex] = p;
    });
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Timetable</h3>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Period</th>
            {days.map((day) => (
              <th key={day} className="border border-gray-300 p-2 text-center">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxPeriods }, (_, i) => (
            <tr key={i}>
              <td className="border border-gray-300 p-2 font-semibold text-center">
                {i + 1}
              </td>
              {days.map((day) => {
                const cell = grid[day]?.[i];
                return (
                  <td
                    key={`${day}-${i}`}
                    className={`border border-gray-300 p-2 text-center text-xs ${
                      cell?.isLab ? "bg-blue-100" : "bg-white"
                    }`}
                  >
                    {cell ? (
                      <div>
                        <div className="font-semibold">{cell.subject?.name || "–"}</div>
                        <div className="text-gray-600">{cell.faculty?.shortName || "–"}</div>
                      </div>
                    ) : (
                      "–"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
