// services/scheduler.service.js
import Faculty from "../models/Faculty.js";
import Subject from "../models/Subject.js";
import ClassRoom from "../models/ClassRoom.js";
import Timetable from "../models/Timetable.js";

/**
 * generateTimetable(classId, options)
 * - loads class, its subjects, their assigned faculty
 * - builds a week matrix (days x periods)
 * - places sessions ensuring faculty not double-booked
 */
export async function generateTimetable(classId, { days = ["Mon","Tue","Wed","Thu","Fri"], periodsPerDay = 6 } = {}) {
  const classRoom = await ClassRoom.findById(classId).populate({
    path: "subjects",
    populate: { path: "faculty" }
  });

  if (!classRoom) throw new Error("Class not found");

  // Flatten subjects with sessions required
  const subjectList = classRoom.subjects.map(s => ({ id: s._id.toString(), name: s.name, sessions: s.sessionsPerWeek || 4, facultyId: s.faculty ? s.faculty._id.toString() : null }));

  // Prepare empty timetable: {dayIndex: [null,...]}
  const week = days.map(() => new Array(periodsPerDay).fill(null));

  // faculty busy map day->period->bool
  const facultyBusy = {}; // { facultyId: Set of "day-period" strings }

  const placeSession = (dayIdx, periodIdx, subj) => {
    week[dayIdx][periodIdx] = { subject: subj.id, faculty: subj.facultyId };
    facultyBusy[subj.facultyId] = facultyBusy[subj.facultyId] || new Set();
    facultyBusy[subj.facultyId].add(`${dayIdx}-${periodIdx}`);
  };

  // Very simple greedy scheduler: iterate subjects, place their sessions in available slots
  for (const subj of subjectList) {
    let sessionsToPlace = subj.sessions;
    // naive round-robin over slots
    for (let d = 0; d < days.length && sessionsToPlace > 0; d++) {
      for (let p = 0; p < periodsPerDay && sessionsToPlace > 0; p++) {
        // slot available?
        if (week[d][p] === null) {
          // check faculty free
          const key = `${d}-${p}`;
          const busySet = facultyBusy[subj.facultyId] || new Set();
          if (!busySet.has(key)) {
            placeSession(d, p, subj);
            sessionsToPlace--;
          }
        }
      }
    }
    if (sessionsToPlace > 0) {
      // couldn't place all sessions with this naive pass — you can implement backtracking or retries
      throw new Error(`Could not place all sessions for subject ${subj.name}. Try increasing periods or check faculty conflicts.`);
    }
  }

  // convert week matrix to Timetable periods array
  const periods = [];
  for (let d = 0; d < days.length; d++) {
    for (let p = 0; p < periodsPerDay; p++) {
      const cell = week[d][p];
      if (cell) {
        periods.push({
          day: days[d],
          periodIndex: p,
          subject: cell.subject,
          faculty: cell.faculty,
          classRoom: classRoom._id
        });
      }
    }
  }

  const tt = new Timetable({ classRoom: classRoom._id, periods });
  await tt.save();
  return tt;
}
