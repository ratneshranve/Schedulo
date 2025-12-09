import React, { useEffect, useState } from "react";
import { getClasses, getFaculty, getSubjects, fetchTimetableForClass, generateAllTimetables } from "../api";
import ClassCard from "./ClassCard";
import TimetableGrid from "./TimetableGrid";

export default function Dashboard(){
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(()=>{ loadAll(); },[]);

  async function loadAll(){
    setLoading(true);
    try {
      const cls = await getClasses();
      const fac = await getFaculty();
      const sub = await getSubjects();
      setClasses(cls || []);
      setFaculty(fac || []);
      setSubjects(sub || []);
      if (cls && cls.length) setSelectedClass(cls[0]);
    } catch(err){ console.error(err); }
    setLoading(false);
  }

  useEffect(()=>{
    if (!selectedClass) return;
    (async ()=>{
      setLoading(true);
      const tt = await fetchTimetableForClass(selectedClass._id);
      setTimetable(tt || null);
      setLoading(false);
    })();
  },[selectedClass]);

  async function handleGenerateAll(){
    if(!window.confirm("This will generate timetables for ALL classes (may take a while). Continue?")) return;
    setLog([]);
    setLoading(true);
    try {
      setLog(l => [...l, "Requesting server to generate timetables..."]);
      const result = await generateAllTimetables({ periodsPerDay: 8 });
      setLog(l => [...l, "Server response received."]);
      if (result && result.timetables) {
        setLog(l => [...l, `Generated ${result.timetables.length} timetables.`]);
        // reload classes and current selected timetable
        await loadAll();
        if (selectedClass) {
          const tt = await fetchTimetableForClass(selectedClass._id);
          setTimetable(tt || null);
        }
      } else {
        setLog(l => [...l, JSON.stringify(result)]);
      }
    } catch (err) {
      setLog(l => [...l, "Error: " + (err.message || err)]);
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Classes</h2>
          <button onClick={handleGenerateAll} className="px-3 py-1 bg-rose-500 text-white rounded hover:bg-rose-600">Generate All</button>
        </div>

        {loading && <div className="text-sm text-slate-500 mb-2">Loading...</div>}

        <div className="space-y-2">
          {classes.length === 0 && <div className="text-slate-500">No classes found</div>}
          {classes.map(c => (
            <ClassCard
              key={c._id}
              cls={c}
              selected={selectedClass && selectedClass._id === c._id}
              onSelect={() => setSelectedClass(c)}
            />
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Activity Log</h3>
          <div className="bg-slate-50 h-40 overflow-auto p-2 rounded border">
            {log.map((l,i)=> <div key={i} className="text-xs text-slate-600">{l}</div>)}
          </div>
        </div>
      </aside>

      <section className="col-span-9">
        <div className="bg-white p-4 rounded-lg shadow">
          {selectedClass ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedClass.name} — Timetable</h2>
                <div className="text-sm text-slate-500">Periods/Day: {selectedClass.periodsPerDay || 8}</div>
              </div>

              {timetable ? (
                <TimetableGrid timetable={timetable} periodsPerDay={selectedClass.periodsPerDay || 8} />
              ) : (
                <div className="text-slate-500">No timetable found. Click Generate All to create timetables.</div>
              )}
            </>
          ) : <div>Select a class to view timetable.</div>}
        </div>
      </section>
    </div>
  );
}
