import { useEffect, useState } from "react";
import { api } from "../api";

export default function FacultyTimetableView({ facultyId }) {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const tt = await api.getTimetableForFaculty(facultyId);
        setTimetable(tt);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, [facultyId]);

  if (loading) return <div className="text-gray-600">Loading timetable...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!timetable || !timetable.periods) {
    return <div className="text-gray-600">No timetable found for this faculty.</div>;
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = 8;

  // Build grid
  const grid = {};
  for (let d = 0; d < days.length; d++) {
    grid[d] = {};
    for (let p = 0; p < periods; p++) {
      grid[d][p] = null;
    }
  }

  timetable.periods.forEach((period) => {
    const dayIdx = days.indexOf(period.day);
    if (dayIdx >= 0) {
      grid[dayIdx][period.periodIndex] = period;
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-3 py-2 w-20">Period</th>
            {days.map((day) => (
              <th key={day} className="border border-gray-300 px-3 py-2">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: periods }).map((_, p) => (
            <tr key={p}>
              <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">
                P{p + 1}
              </td>
              {days.map((_, d) => {
                const cell = grid[d][p];
                return (
                  <td
                    key={`${d}-${p}`}
                    className={`border border-gray-300 px-3 py-2 text-center text-sm ${
                      cell ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    {cell && (
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {(() => {
                            if (typeof cell.subject === 'object' && cell.subject?.name) return cell.subject.name;
                            if (typeof cell.subject === 'string') return cell.subject;
                            return "Unknown";
                          })()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {(() => {
                            if (typeof cell.subject === 'object' && cell.subject?.code) return cell.subject.code;
                            return "";
                          })()}
                        </div>
                        {cell.isLab && <div className="text-xs text-purple-600 font-bold">LAB</div>}
                      </div>
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
