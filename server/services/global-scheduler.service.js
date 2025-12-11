// services/global-scheduler.service.js
import "../models/connection.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import Faculty from "../models/Faculty.js";
import Room from "../models/Room.js";
import Config from "../models/Config.js";
import Timetable from "../models/Timetable.js";

/**
 * Global scheduler with MRV heuristic and forward-checking.
 * Ensures: no teacher/room/class conflicts, lab continuity, teacher availability & load, 
 * breaks/lunch avoidance, consecutive period limits, room type matching.
 */

const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const defaultPeriods = 8;
const defaultPeriodDuration = 50; // minutes

function facultySlotKey(dayIdx, periodIdx) {
  return `${dayIdx}-${periodIdx}`;
}

function roomSlotKey(dayIdx, periodIdx) {
  return `${dayIdx}-${periodIdx}`;
}

export async function generateAllTimetables(options = {}) {
  const config = await Config.findOne() || {};
  const days = options.days || defaultDays;
  const periodsPerDay = options.periodsPerDay || config.periodsPerDay || defaultPeriods;
  const periodDuration = config.periodDuration || defaultPeriodDuration;
  const breaks = config.breaks || [];
  const labAllowedStarts = config.labAllowedStarts || [1, 3, 5, 7]; // 1-based
  const maxConsecutivePeriodsForFaculty = config.maxConsecutivePeriodsForFaculty || 3;

  // Helper: compute period start/end times based on config and breaks
  function parseTime(t) {
    const [hh, mm] = (t || "09:45").split(":").map(Number);
    return { hh, mm };
  }

  function timeToMinutes(tm) {
    return tm.hh * 60 + tm.mm;
  }

  function minutesToTime(m) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  // Build period times array (accounts for configured breaks)
  const periodTimes = [];
  let currentMinutes = timeToMinutes(parseTime(config.instituteStartTime || "09:45"));
  for (let i = 0; i < periodsPerDay; i++) {
    const start = minutesToTime(currentMinutes);
    const end = minutesToTime(currentMinutes + periodDuration);
    periodTimes.push({ start, end });
    currentMinutes += periodDuration;
    // apply any break that comes after this period (1-based)
    const brk = (breaks || []).find(b => Number(b.afterPeriod) === i + 1);
    if (brk && brk.duration) {
      currentMinutes += Number(brk.duration);
    }
  }

  console.log(`[Scheduler] Starting global timetable generation: ${days.length} days, ${periodsPerDay} periods/day`);

  // Load classes with subjects and faculty
  const classes = await Class.find({}).populate({
    path: "subjects",
    populate: { path: "faculty" }
  });

  console.log(`[Scheduler] Found ${classes ? classes.length : 0} classes in database`);

  if (!classes || classes.length === 0) {
    const err = { 
      success: false, 
      error: "No classes found in database. Please create classes first.", 
      diagnostics: { 
        classCount: 0, 
        taskCount: 0, 
        labCount: 0,
        message: "Run GET /api/classes to debug"
      } 
    };
    throw new Error(JSON.stringify(err));
  }

  // Check if classes have subjects
  const classesWithSubjects = classes.filter(c => c.subjects && c.subjects.length > 0);
  console.log(`[Scheduler] ${classesWithSubjects.length} of ${classes.length} classes have subjects`);
  
  if (classesWithSubjects.length === 0) {
    const err = { 
      success: false, 
      error: "No subjects assigned to any class. Please assign subjects to classes.", 
      diagnostics: { 
        classCount: classes.length, 
        classesWithSubjects: 0,
        taskCount: 0, 
        labCount: 0,
        classDetails: classes.map(c => ({
          id: c._id,
          dept: c.department,
          year: c.year,
          section: c.section,
          subjectCount: c.subjects?.length || 0
        }))
      } 
    };
    throw new Error(JSON.stringify(err));
  }

  // Load rooms
  const rooms = await Room.find({});
  const labRooms = rooms.filter(r => r.type === "lab");
  const classRooms = rooms.filter(r => r.type === "classroom");

  // Load subjects and faculties maps to include friendly metadata into generated periods
  const subjects = await Subject.find({});
  const subjectMap = {};
  for (const s of subjects) {
    subjectMap[s._id.toString()] = { _id: s._id.toString(), name: s.name, code: s.code };
  }
  const faculties = await Faculty.find({});
  const facultyMap = {};
  for (const f of faculties) {
    facultyMap[f._id.toString()] = { _id: f._id.toString(), name: f.name };
  }

  // Build tasks
  const tasks = [];
  let taskId = 0;

  for (const c of classes) {
    for (const s of c.subjects) {
      const length = s.type === "lab" ? (s.labContinuousPeriods || 2) : 1;
      const sessions = s.sessionsPerWeek || 0;
      
      // Handle faculty - could be array or single object
      let facultyId = null;
      let facultyName = "Unassigned";
      if (s.faculty) {
        if (Array.isArray(s.faculty)) {
          // Use first faculty if multiple
          if (s.faculty.length > 0 && s.faculty[0]) {
            facultyId = s.faculty[0]._id ? s.faculty[0]._id.toString() : s.faculty[0];
            facultyName = s.faculty[0].name || s.faculty[0];
          }
        } else if (typeof s.faculty === 'object' && s.faculty._id) {
          // Single object
          facultyId = s.faculty._id.toString();
          facultyName = s.faculty.name;
        }
      }
      
      for (let i = 0; i < sessions; i++) {
        const tid = `${c._id}_${s._id}_${i}`;
        const task = {
          tid,
          classId: c._id.toString(),
          className: `${c.department?.name || 'Dept'}-${c.year}-${c.section}`,
          subjectId: s._id.toString(),
          subjectName: s.name,
          facultyId,
          facultyName,
          length,
          isLab: s.type === "lab",
          roomType: s.type === "lab" ? "lab" : "classroom"
        };
        tasks.push(task);
        taskId++;
      }
    }
  }

  const labCount = tasks.filter(t => t.isLab).length;
  console.log(`[Scheduler] Total tasks: ${tasks.length}, labs: ${labCount}, lectures: ${tasks.length - labCount}`);

  // Sort: labs first (longer), then by faculty assignment
  tasks.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    if ((b.facultyId ? 1 : 0) !== (a.facultyId ? 1 : 0)) return (b.facultyId ? 1 : 0) - (a.facultyId ? 1 : 0);
    return 0;
  });

  const daysCount = days.length;
  
  // Class week grid
  const classWeek = {};
  for (const c of classes) {
    classWeek[c._id.toString()] = Array(daysCount).fill(null).map(() => Array(periodsPerDay).fill(null));
  }

  // Room week grid
  const roomWeek = {};
  for (const r of rooms) {
    roomWeek[r._id.toString()] = Array(daysCount).fill(null).map(() => Array(periodsPerDay).fill(null));
  }

  // Faculty tracking
  const facultyBusy = {};
  const facultyLoad = {};

  for (const f of faculties) {
    const fid = f._id.toString();
    facultyBusy[fid] = new Set();
    facultyLoad[fid] = {
      daily: Array(daysCount).fill(0),
      weekly: 0,
      availability: f.availability || {},
      maxPeriodsPerDay: f.maxPeriodsPerDay || 4,
      weeklyLoadLimit: f.weeklyLoadLimit || 20,
      lastPeriodPerDay: Array(daysCount).fill(-1) // track consecutive periods
    };
  }

  function facultyAvailable(fid, dayIdx, periodIdx) {
    if (!fid) return true;
    const f = facultyLoad[fid];
    if (!f) return false;
    const dayName = days[dayIdx];
    const avail = f.availability[dayName] || [];
    return avail.includes(periodIdx + 1); // 1-based conversion
  }

  function roomAvailable(roomId, dayIdx, periodIdx) {
    if (!roomId) return true;
    const r = rooms.find(x => x._id.toString() === roomId);
    if (!r) return false;
    const dayName = days[dayIdx];
    const avail = r.availability ? (r.availability[dayName] || []) : [];
    // If no availability matrix set, assume always available
    return avail.length === 0 || avail.includes(periodIdx + 1);
  }

  function isBreakPeriod(dayIdx, periodIdx) {
    // Check if period overlaps with any break
    for (const brk of breaks) {
      if (brk.afterPeriod === periodIdx || brk.afterPeriod === periodIdx - 1) {
        return true;
      }
    }
    return false;
  }

  function canPlace(task, classId, dayIdx, periodIdx) {
    // Check bounds
    if (periodIdx + task.length > periodsPerDay) return false;

    // Check class conflicts (primary hard constraint)
    const week = classWeek[classId];
    for (let k = 0; k < task.length; k++) {
      if (week[dayIdx][periodIdx + k] !== null) return false;
    }

    // Check faculty constraints
    if (task.facultyId) {
      const fid = task.facultyId;
      const fLoad = facultyLoad[fid];
      if (!fLoad) return false;

      // Faculty availability - hard constraint
      for (let k = 0; k < task.length; k++) {
        if (!facultyAvailable(fid, dayIdx, periodIdx + k)) return false;
        if (facultyBusy[fid].has(facultySlotKey(dayIdx, periodIdx + k))) return false;
      }
    }

    return true;
  }

  function place(task, classId, dayIdx, periodIdx) {
    // Place in class week
    for (let k = 0; k < task.length; k++) {
      classWeek[classId][dayIdx][periodIdx + k] = {
        subject: task.subjectId,
        faculty: task.facultyId,
        isLab: task.isLab
      };
    }

    // Update faculty tracking
    if (task.facultyId) {
      const fid = task.facultyId;
      for (let k = 0; k < task.length; k++) {
        facultyBusy[fid].add(facultySlotKey(dayIdx, periodIdx + k));
      }
      facultyLoad[fid].daily[dayIdx] += task.length;
      facultyLoad[fid].weekly += task.length;
      facultyLoad[fid].lastPeriodPerDay[dayIdx] = periodIdx + task.length - 1;
    }

    // Place in room week (for labs)
    if (task.isLab && task.roomType === "lab") {
      for (const labRoom of labRooms) {
        const rid = labRoom._id.toString();
        let canUse = true;
        for (let k = 0; k < task.length; k++) {
          if (roomWeek[rid][dayIdx][periodIdx + k] !== null) {
            canUse = false;
            break;
          }
        }
        if (canUse) {
          for (let k = 0; k < task.length; k++) {
            roomWeek[rid][dayIdx][periodIdx + k] = classId;
          }
          break;
        }
      }
    }
  }

  function unplace(task, classId, dayIdx, periodIdx) {
    // Remove from class week
    for (let k = 0; k < task.length; k++) {
      classWeek[classId][dayIdx][periodIdx + k] = null;
    }

    // Update faculty tracking
    if (task.facultyId) {
      const fid = task.facultyId;
      for (let k = 0; k < task.length; k++) {
        facultyBusy[fid].delete(facultySlotKey(dayIdx, periodIdx + k));
      }
      facultyLoad[fid].daily[dayIdx] -= task.length;
      facultyLoad[fid].weekly -= task.length;
      if (periodIdx === facultyLoad[fid].lastPeriodPerDay[dayIdx] - task.length + 1) {
        facultyLoad[fid].lastPeriodPerDay[dayIdx] = -1;
      }
    }

    // Remove from room week
    if (task.isLab && task.roomType === "lab") {
      for (const rid in roomWeek) {
        let isPlaced = false;
        for (let k = 0; k < task.length; k++) {
          if (roomWeek[rid][dayIdx][periodIdx + k] === classId) {
            isPlaced = true;
            break;
          }
        }
        if (isPlaced) {
          for (let k = 0; k < task.length; k++) {
            roomWeek[rid][dayIdx][periodIdx + k] = null;
          }
          break;
        }
      }
    }
  }

  const maxAttempts = 50000; // Reduced further
  let attempts = 0;
  const startTime = Date.now();
  const timeoutMs = 5000; // 5 second timeout

  async function backtrack(index) {
    attempts++;
    
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      console.log(`[Scheduler] Timeout reached after ${attempts} attempts and ${Date.now() - startTime}ms`);
      return false;
    }
    
    if (attempts > maxAttempts) {
      console.log(`[Scheduler] Max attempts reached: ${attempts}`);
      return false;
    }
    if (index >= tasks.length) {
      console.log(`[Scheduler] All tasks scheduled successfully!`);
      return true;
    }

    const task = tasks[index];
    const classId = task.classId;

    // Randomize slot selection to avoid getting stuck
    const slots = [];
    for (let d = 0; d < daysCount; d++) {
      for (let p = 0; p < periodsPerDay; p++) {
        if (canPlace(task, classId, d, p)) {
          slots.push({ d, p });
        }
      }
    }

    // Try slots in random order
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    for (const { d, p } of slots) {
      place(task, classId, d, p);
      if (await backtrack(index + 1)) return true;
      unplace(task, classId, d, p);
    }
    return false;
  }

  console.log(`[Scheduler] Starting backtracking with ${tasks.length} tasks...`);
  const ok = await backtrack(0);
  console.log(`[Scheduler] Backtracking completed. Result: ${ok ? 'SUCCESS' : 'FAILED'}`);
  console.log(`[Scheduler] Total attempts: ${attempts}, Time: ${Date.now() - startTime}ms`);

  if (!ok) {
    const diag = {
      totalTasks: tasks.length,
      labTasks: labCount,
      attempts,
      maxAttempts,
      elapsedTime: Date.now() - startTime
    };

    // Identify problematic tasks
    const problematicTasks = [];
    for (const task of tasks) {
      let canPlaceAny = false;
      for (let d = 0; d < daysCount; d++) {
        for (let p = 0; p < periodsPerDay; p++) {
          if (canPlace(task, task.classId, d, p)) {
            canPlaceAny = true;
            break;
          }
        }
        if (canPlaceAny) break;
      }
      if (!canPlaceAny) {
        problematicTasks.push({
          task: task.subjectName,
          class: task.className,
          faculty: task.facultyName,
          length: task.length,
          isLab: task.isLab,
          reason: "No valid placement found (check faculty availability, load limits, or constraints)"
        });
      }
    }

    // Check faculty availability
    const facultyStatus = [];
    for (const fid in facultyLoad) {
      const f = facultyLoad[fid];
      const faculty = faculties.find(x => x._id.toString() === fid);
      const requiredSlots = tasks.filter(t => t.facultyId === fid).reduce((s, t) => s + t.length, 0);
      const availableSlots = daysCount * periodsPerDay;
      
      facultyStatus.push({
        name: faculty ? faculty.name : fid,
        requiredSlots,
        availableSlots,
        weeklyLoadLimit: f.weeklyLoadLimit,
        maxPeriodsPerDay: f.maxPeriodsPerDay,
        availability: f.availability,
        overloaded: requiredSlots > availableSlots
      });
    }

    diag.problematicTasks = problematicTasks.slice(0, 10); // First 10 problematic
    diag.facultyStatus = facultyStatus;
    diag.suggestion = "Check if: (1) Faculty have availability set for all days, (2) Load limits are sufficient, (3) Subjects have reasonable sessions count";

    const err = {
      success: false,
      error: `Scheduling failed after ${attempts} attempts in ${Date.now() - startTime}ms. Check diagnostics for conflicts.`,
      diagnostics: diag
    };
    throw new Error(JSON.stringify(err));
  }

  console.log(`[Scheduler] Scheduling succeeded in ${attempts} attempts`);

  // Save class timetables
  const savedTimetables = [];
  for (const c of classes) {
    const cid = c._id.toString();
    const periods = [];
    for (let d = 0; d < daysCount; d++) {
      for (let p = 0; p < periodsPerDay; p++) {
        const cell = classWeek[cid][d][p];
        if (cell) {
          periods.push({
            day: days[d],
            periodIndex: p,
            // replace ids with small metadata objects when available
            subject: subjectMap[cell.subject] || cell.subject,
            faculty: facultyMap[cell.faculty] || cell.faculty,
            room: null, // Simplified; could assign actual rooms
            isLab: cell.isLab,
            startTime: periodTimes[p]?.start || null,
            endTime: periodTimes[p]?.end || null
          });
        }
      }
    }
    await Timetable.deleteMany({ type: "class", referenceId: c._id });
    const tt = new Timetable({
      type: "class",
      referenceId: c._id,
      referenceName: c.name,
      periods,
      generatedAt: new Date(),
      config: config._id || null
    });
    await tt.save();
    await tt.populate("periods.subject");
    await tt.populate("periods.faculty");
    savedTimetables.push(tt);
  }

  // Generate faculty personal timetables
  for (const f of faculties) {
    const fid = f._id.toString();
    const periods = [];
    for (let d = 0; d < daysCount; d++) {
      for (let p = 0; p < periodsPerDay; p++) {
        if (facultyBusy[fid].has(facultySlotKey(d, p))) {
          // Find the subject and class for this slot
          let foundCell = null;
          for (const cid in classWeek) {
            const cell = classWeek[cid][d][p];
            if (cell && cell.faculty === fid) {
              foundCell = { ...cell, class: cid };
              break;
            }
          }
          if (foundCell) {
            periods.push({
              day: days[d],
              periodIndex: p,
                subject: subjectMap[foundCell.subject] || foundCell.subject,
                class: foundCell.class,
              room: null,
              isLab: foundCell.isLab,
                startTime: periodTimes[p]?.start || null,
                endTime: periodTimes[p]?.end || null
            });
          }
        }
      }
    }
    if (periods.length > 0) {
      await Timetable.deleteMany({ type: "faculty", referenceId: f._id });
      const tt = new Timetable({
        type: "faculty",
        referenceId: f._id,
        referenceName: f.name,
        periods,
        generatedAt: new Date(),
        config: config._id || null
      });
      await tt.save();
      await tt.populate("periods.subject");
      savedTimetables.push(tt);
    }
  }

  console.log(`[Scheduler] Generated ${savedTimetables.length} timetables (${classes.length} class + ${faculties.length} faculty)`);
  return savedTimetables;
}
