import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// DB
import './models/connection.js';

// Routers
import facultyRouter from './routes/faculty.routes.js';
import subjectRouter from './routes/subject.routes.js';
import classRouter from './routes/class.routes.js';
import timetableRouter from './routes/timetable.routes.js';
import roomRouter from './routes/room.routes.js';
import configRouter from './routes/config.routes.js';
import departmentRouter from './routes/department.routes.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/api/faculty", facultyRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/classes", classRouter);
app.use("/api/timetable", timetableRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/config", configRouter);
app.use("/api/departments", departmentRouter);

app.get("/", (_, res) => res.send("Schedulo backend running"));

// basic error handler
app.use((err, req, res, next) => {
	console.error(err);
	if (res.headersSent) return next(err);
	res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(3001, () => console.log("Server running at http://localhost:3001"));
