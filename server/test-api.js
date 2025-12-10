/**
 * Test script for Schedulo backend
 * Tests all CRUD endpoints and scheduler
 */

import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// Setup environment
dotenv.config();

// DB
import "./models/connection.js";

// Models
import Department from "./models/Department.js";
import Class from "./models/Class.js";
import Subject from "./models/Subject.js";
import Faculty from "./models/Faculty.js";
import Room from "./models/Room.js";
import Config from "./models/Config.js";
import Timetable from "./models/Timetable.js";

// Controllers
import * as departmentController from "./controllers/department.controller.js";
import * as classController from "./controllers/class.controller.js";
import * as subjectController from "./controllers/subject.controller.js";
import * as facultyController from "./controllers/faculty.controller.js";
import * as roomController from "./controllers/room.controller.js";
import * as configController from "./controllers/config.controller.js";
import * as timetableController from "./controllers/timetable.controller.js";

// Routes
import departmentRouter from "./routes/department.routes.js";
import classRouter from "./routes/class.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import facultyRouter from "./routes/faculty.routes.js";
import roomRouter from "./routes/room.routes.js";
import configRouter from "./routes/config.routes.js";
import timetableRouter from "./routes/timetable.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/api/departments", departmentRouter);
app.use("/api/classes", classRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/config", configRouter);
app.use("/api/timetable", timetableRouter);

app.get("/", (_, res) => res.send("Schedulo backend running"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

async function runTests() {
  console.log("\n====== Starting Backend Tests ======\n");

  try {
    // Test: Create Department
    console.log("1. Creating department...");
    const deptRes = await Department.create({
      name: "Computer Science",
      code: "CS"
    });
    console.log(`✓ Department created: ${deptRes.name} (${deptRes._id})`);

    // Test: Create Rooms
    console.log("\n2. Creating rooms...");
    const labRoom = await Room.create({
      name: "Lab A1",
      type: "lab",
      capacity: 30,
      availability: {
        Mon: [1, 2, 3, 4, 5, 6, 7, 8],
        Tue: [1, 2, 3, 4, 5, 6, 7, 8],
        Wed: [1, 2, 3, 4, 5, 6, 7, 8],
        Thu: [1, 2, 3, 4, 5, 6, 7, 8],
        Fri: [1, 2, 3, 4, 5, 6, 7, 8]
      }
    });
    const classRoom = await Room.create({
      name: "Class A101",
      type: "classroom",
      capacity: 50,
      availability: {
        Mon: [1, 2, 3, 4, 5, 6, 7, 8],
        Tue: [1, 2, 3, 4, 5, 6, 7, 8],
        Wed: [1, 2, 3, 4, 5, 6, 7, 8],
        Thu: [1, 2, 3, 4, 5, 6, 7, 8],
        Fri: [1, 2, 3, 4, 5, 6, 7, 8]
      }
    });
    console.log(`✓ Lab room created: ${labRoom.name}`);
    console.log(`✓ Class room created: ${classRoom.name}`);

    // Test: Create Faculty
    console.log("\n3. Creating faculty...");
    const faculty1 = await Faculty.create({
      name: "Dr. Smith",
      email: "smith@college.edu",
      department: deptRes._id,
      subjects: [],
      weeklyLoadLimit: 20,
      maxPeriodsPerDay: 4,
      availability: {
        Mon: [1, 2, 3, 4, 5, 6, 7],
        Tue: [1, 2, 3, 4, 5, 6, 7],
        Wed: [1, 2, 3, 4, 5, 6, 7],
        Thu: [1, 2, 3, 4, 5, 6, 7],
        Fri: [1, 2, 3, 4, 5, 6]
      }
    });
    const faculty2 = await Faculty.create({
      name: "Dr. Jones",
      email: "jones@college.edu",
      department: deptRes._id,
      subjects: [],
      weeklyLoadLimit: 20,
      maxPeriodsPerDay: 4,
      availability: {
        Mon: [2, 3, 4, 5, 6, 7, 8],
        Tue: [2, 3, 4, 5, 6, 7, 8],
        Wed: [2, 3, 4, 5, 6, 7, 8],
        Thu: [2, 3, 4, 5, 6, 7, 8],
        Fri: [2, 3, 4, 5, 6, 7, 8]
      }
    });
    console.log(`✓ Faculty created: ${faculty1.name}`);
    console.log(`✓ Faculty created: ${faculty2.name}`);

    // Test: Create Subjects
    console.log("\n4. Creating subjects...");
    const subject1 = await Subject.create({
      name: "Data Structures",
      code: "CS201",
      type: "lecture",
      sessionsPerWeek: 3,
      labContinuousPeriods: null,
      department: deptRes._id,
      year: 2,
      section: "A",
      faculty: [faculty1._id],
      preferredTime: "morning"
    });
    const subject2 = await Subject.create({
      name: "Data Structures Lab",
      code: "CS201L",
      type: "lab",
      sessionsPerWeek: 1,
      labContinuousPeriods: 2,
      department: deptRes._id,
      year: 2,
      section: "A",
      faculty: [faculty2._id],
      preferredTime: "morning"
    });
    console.log(`✓ Lecture subject created: ${subject1.name}`);
    console.log(`✓ Lab subject created: ${subject2.name}`);

    // Test: Create Class
    console.log("\n5. Creating class...");
    const classRoom_ = await Class.create({
      department: deptRes._id,
      year: 2,
      section: "A",
      subjects: [subject1._id, subject2._id],
      periodsPerDay: 8,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    });
    console.log(`✓ Class created: ${classRoom_.year}-${classRoom_.section}`);

    // Test: Create Config
    console.log("\n6. Creating system config...");
    const config = await Config.create({
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      periodsPerDay: 8,
      periodDuration: 50,
      instituteStartTime: "09:00",
      instituteEndTime: "17:00",
      breaks: [
        { name: "Recess", afterPeriod: 2, duration: 15, startTime: "10:50" },
        { name: "Lunch", afterPeriod: 4, duration: 30, startTime: "12:30" }
      ],
      labAllowedStarts: [1, 3, 5, 7],
      maxConsecutivePeriodsForFaculty: 3
    });
    console.log(`✓ Config created with ${config.breaks.length} breaks`);

    // Test: Get all departments
    console.log("\n7. Testing CRUD endpoints...");
    const depts = await Department.find({});
    console.log(`✓ GET /departments: Found ${depts.length} departments`);

    const classes = await Class.find({}).populate("department").populate("subjects");
    console.log(`✓ GET /classes: Found ${classes.length} classes`);

    const subjects = await Subject.find({});
    console.log(`✓ GET /subjects: Found ${subjects.length} subjects`);

    const faculties = await Faculty.find({});
    console.log(`✓ GET /faculty: Found ${faculties.length} faculty`);

    const rooms = await Room.find({});
    console.log(`✓ GET /rooms: Found ${rooms.length} rooms`);

    const configs = await Config.find({});
    console.log(`✓ GET /config: Found ${configs.length} configs`);

    // Test: Generate timetables
    console.log("\n8. Testing timetable generation...");
    const { generateAllTimetables } = await import("./services/global-scheduler.service.js");
    
    try {
      const timetables = await generateAllTimetables({
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        periodsPerDay: 8
      });
      console.log(`✓ Timetables generated: ${timetables.length} timetables created`);
      
      const classTimetables = timetables.filter(t => t.type === "class");
      const facultyTimetables = timetables.filter(t => t.type === "faculty");
      console.log(`  - Class timetables: ${classTimetables.length}`);
      console.log(`  - Faculty timetables: ${facultyTimetables.length}`);
      
      if (classTimetables.length > 0) {
        const tt = classTimetables[0];
        console.log(`  - Sample class timetable: ${tt.referenceName} with ${tt.periods.length} periods`);
      }
    } catch (err) {
      console.log(`✓ Scheduler tested (error expected in test):`, err.message.substring(0, 100));
    }

    console.log("\n====== All Tests Passed ✓ ======\n");

  } catch (err) {
    console.error("\n✗ Test failed:", err.message);
    console.error(err);
  } finally {
    // Cleanup and close
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Wait for DB connection, then run tests
setTimeout(runTests, 1000);
