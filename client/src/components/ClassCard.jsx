import React from "react";

export default function ClassCard({ cls, selected, onSelect }){
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer p-3 rounded border ${selected ? "border-indigo-400 bg-indigo-50" : "border-slate-100 hover:shadow"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{cls.name}</div>
          <div className="text-xs text-slate-500">Semester: {cls.semester || "-"}</div>
        </div>
        <div className="text-sm text-slate-600">{(cls.subjects && cls.subjects.length) || 0} subjects</div>
      </div>
    </div>
  );
}
