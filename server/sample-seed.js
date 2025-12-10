// sample-seed.js - Seed database with minimal sample data
import mongoose from "mongoose";
import dotenv from "dotenv";
import Faculty from "./models/Faculty.js";
import Subject from "./models/Subject.js";
import ClassRoom from "./models/ClassRoom.js";
import Room from "./models/Room.js";
import Config from "./models/Config.js";

dotenv.config();

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/schedulo";

async function seed() {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Faculty.deleteMany({});
    await Subject.deleteMany({});
    await ClassRoom.deleteMany({});
    await Room.deleteMany({});
    await Config.deleteMany({});

    // Create faculties
    const faculty1 = await Faculty.create({
      name: "Dr. Alice Johnson",
      shortName: "AJ",
      availability: {
        Mon: [1, 2, 3, 4, 5, 6, 7, 8],
        Tue: [1, 2, 3, 4, 5, 6, 7, 8],
        Wed: [1, 2, 3, 4, 5, 6, 7, 8],
        Thu: [1, 2, 3, 4, 5, 6, 7, 8],
        Fri: [1, 2, 3, 4, 5, 6, 7, 8]
      },
      maxLoadPerDay: 4,
      maxLoadPerWeek: 20
    });

    const faculty2 = await Faculty.create({
      name: "Dr. Bob Smith",
      shortName: "BS",
      availability: {
        Mon: [2, 3, 4, 5, 6, 7, 8],
        Tue: [2, 3, 4, 5, 6, 7, 8],
        Wed: [2, 3, 4, 5, 6, 7, 8],
        Thu: [2, 3, 4, 5, 6, 7, 8],
        Fri: [2, 3, 4, 5, 6, 7, 8]
      },
      maxLoadPerDay: 4,
      maxLoadPerWeek: 20
    });

    console.log(`Created ${[faculty1, faculty2].length} faculties`);

    // Create rooms
    const room1 = await Room.create({
      name: "Lab-1",
      type: "lab",
      capacity: 30
    });

    const room2 = await Room.create({
      name: "Classroom-A",
      type: "classroom",
      capacity: 50
    });

    const room3 = await Room.create({
      name: "Classroom-B",
      type: "classroom",
      capacity: 50
    });

    console.log(`Created ${[room1, room2, room3].length} rooms`);

    // Create subjects
    const subject1 = await Subject.create({
      name: "Data Structures",
      code: "CS201",
      type: "lecture",
      sessionsPerWeek: 3,
      faculty: faculty1._id
    });

    const subject2 = await Subject.create({
      name: "Database Lab",
      code: "CS202L",
      type: "lab",
      sessionsPerWeek: 2,
      labSizePeriods: 2,
      faculty: faculty2._id
    });

    console.log(`Created ${[subject1, subject2].length} subjects`);

    // Create class
    const classroom = await ClassRoom.create({
      name: "CSE-2A",
      department: "Computer Science",
      year: 2,
      section: "A",
      subjects: [subject1._id, subject2._id],
      periodsPerDay: 8,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    });

    console.log(`Created class: ${classroom.name}`);

    // Create/update config
    await Config.create({
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      periodsPerDay: 8,
      periodDurationMinutes: 50,
      breaks: [
        { afterPeriod: 4, durationMinutes: 30 }
      ],
      labAllowedStarts: [1, 3, 5, 7]
    });

    console.log("Created global config");
    console.log("\n✓ Seed completed successfully!");
    console.log(`\nNow run: POST http://localhost:3001/api/timetable/generate-all`);
    console.log(`Then run: GET http://localhost:3001/api/timetable/class/${classroom._id}`);

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
