import React from "react";

/**
 * timetable object shape:
 * {
 *  classRoom: { ... },
 *  periods: [{ day: "Mon", periodIndex: 0, subject: {_id/...} or subject: id, faculty: id }]
 * }
 *
 * We'll render a grid: rows = days, columns = periods (1..8)
 */

const DAYS = ["Mon","Tue","Wed","Thu","Fri"];

export default function TimetableGrid({ timetable, periodsPerDay = 8 }){
  // build matrix
  const matrix = DAYS.map(d => new Array(periodsPerDay).fill(null));
  if (timetable && timetable.periods) {
    timetable.periods.forEach(p => {
      const d = DAYS.indexOf(p.day);
      if (d >= 0 && p.periodIndex < periodsPerDay) {
        matrix[d][p.periodIndex] = p;
      }
    });
  }

  // helper to display subject name or fallback
  const getLabel = (cell) => {
    if (!cell) return "";
    if (cell.subject && typeof cell.subject === "object") {
      return cell.subject.name || "Sub";
    }
    return "Subject";
  };

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 bg-slate-100 text-left">Day</th>
            {Array.from({length: periodsPerDay}).map((_,i)=>(
              <th key={i} className="p-2 bg-slate-100 text-center">P{i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day,ri)=>(
            <tr key={day} className="border-b">
              <td className="p-2 font-medium">{day}</td>
              {matrix[ri].map((cell,ci)=> {
                // show recess (break) after 2,4,6 (i.e between 2-3)
                const isBreakAfter = (ci === 2 || ci === 4 || ci === 6);
                return (
                  <td key={ci} className="p-2 align-top text-center">
                    <div className="min-h-[48px] flex items-center justify-center">
                      {cell ? (
                        <div className="text-sm">
                          <div className="font-medium">{cell.subject?.name || getLabel(cell)}</div>
                          <div className="text-xs text-slate-500">{cell.faculty?.name || (cell.faculty || "")}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400">—</div>
                      )}
                    </div>
                    {isBreakAfter && <div className="text-xs text-amber-700 mt-1">⏳ Recess</div>}
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
