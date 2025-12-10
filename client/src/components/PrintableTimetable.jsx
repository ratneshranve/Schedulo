import { useEffect, useState } from "react";
import { api } from "../api";

export default function PrintableTimetable({ type = "class", referenceId, referenceName, config }) {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const tt = type === "class"
          ? await api.getTimetableForClass(referenceId)
          : await api.getTimetableForFaculty(referenceId);
        setTimetable(tt);
      } catch (err) {
        setError(err.message || "Failed to load timetable");
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, [referenceId, type]);

  if (loading) return <div className="text-center py-8">Loading timetable...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (!timetable || !timetable.periods) return <div className="text-center py-8">No timetable found</div>;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periodsPerDay = 8;
  const instituteName = config?.instituteName || "IPS Academy";
  const department = config?.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Build grid
  const grid = {};
  for (const day of days) {
    grid[day] = {};
    for (let i = 0; i < periodsPerDay; i++) {
      grid[day][i] = null;
    }
  }

  if (timetable.periods && Array.isArray(timetable.periods)) {
    timetable.periods.forEach((period) => {
      if (grid[period.day]) {
        grid[period.day][period.periodIndex] = period;
      }
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = (idx, period) => {
    if (period?.startTime && period?.endTime) {
      return `${period.startTime}-${period.endTime}`;
    }
    return `P${idx + 1}`;
  };

  const getSubjectDisplay = (subject) => {
    if (!subject) return "–";
    if (typeof subject === "object") {
      return subject.code || subject.name || "–";
    }
    return subject;
  };

  const getFacultyDisplay = (faculty) => {
    if (!faculty) return "–";
    if (typeof faculty === "object") {
      return faculty.name || "–";
    }
    return faculty;
  };

  return (
    <div className="w-full bg-white p-8 printable-timetable">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .printable-timetable { page-break-inside: avoid; }
          .print-button { display: none; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 11px; }
          .header { text-align: center; margin-bottom: 20px; font-weight: bold; }
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: center; font-size: 12px; }
        th { background-color: #e8e8e8; font-weight: bold; }
        .subject-name { font-weight: bold; font-size: 11px; }
        .faculty-name { font-size: 10px; color: #555; }
      `}</style>

      {/* Header */}
      <div className="header mb-6 text-center">
        <h1 className="text-2xl font-bold">{instituteName}</h1>
        <p className="text-sm text-gray-600">Department of Computer Science & Information Technology</p>
        <p className="text-sm font-semibold mt-2">
          {type === "class" ? `Class: ${referenceName}` : `Faculty: ${referenceName}`}
        </p>
        <p className="text-xs text-gray-500 mt-1">Time-Table: July-Dec 2025</p>
      </div>

      {/* Timetable */}
      <table>
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Day/Time</th>
            {Array.from({ length: periodsPerDay }).map((_, i) => {
              const period = Object.values(grid).find(d => d[i])?.[i];
              return (
                <th key={i} style={{ width: `${88 / periodsPerDay}%` }}>
                  {getPeriodLabel(i, period)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="font-semibold bg-gray-50">{day}</td>
              {Array.from({ length: periodsPerDay }).map((_, periodIdx) => {
                const cell = grid[day]?.[periodIdx];
                return (
                  <td key={`${day}-${periodIdx}`} className={cell ? "bg-blue-50" : "bg-white"}>
                    {cell ? (
                      <div>
                        <div className="subject-name">
                          {getSubjectDisplay(cell.subject)}
                        </div>
                        <div className="faculty-name">
                          {getFacultyDisplay(cell.faculty)}
                        </div>
                        {cell.isLab && <div className="text-xs text-purple-600 font-bold">LAB</div>}
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

      {/* Footer & Button */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <p>Generated: {new Date().toLocaleDateString()}</p>
        </div>
        <button
          onClick={handlePrint}
          className="print-button bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
        >
          📥 Download PDF / Print
        </button>
      </div>
    </div>
  );
}
