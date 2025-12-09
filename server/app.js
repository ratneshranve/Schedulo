// app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// routers
import userRouter from "./routes/user.routes.js";
import facultyRouter from "./routes/faculty.routes.js";
import subjectRouter from "./routes/subject.routes.js";
import classRouter from "./routes/class.routes.js";
import timetableRouter from "./routes/timetable.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/classes", classRouter);
app.use("/api/timetable", timetableRouter);

app.get("/", (req, res) => res.send("Schedulo backend running"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
