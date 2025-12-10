# Schedulo – College Timetable Generator

A modern MERN stack application for generating conflict-free college timetables using advanced constraint-solving algorithms.

## Features

- **Global Scheduler**: Generates zero-conflict timetables for all classes simultaneously using MRV heuristic and forward-checking
- **Constraint Enforcement**:
  - No teacher/room/class conflicts
  - Lab scheduling (continuous 2-period blocks at allowed starts: 1, 3, 5, 7)
  - Teacher availability & load limits (per-day and per-week)
  - Subject session-per-week compliance
- **Modern Tech Stack**:
  - Backend: Node.js (ESM), Express, MongoDB (Mongoose v7+)
  - Frontend: React (Create React App), Tailwind CSS
  - Real-time diagnostics on scheduling failures
- **Intuitive Admin UI**:
  - Create faculties, subjects, classes, rooms
  - Edit faculty availability (click-to-toggle grid)
  - Run generation and view timetables in tabular format
  - Diagnostics modal showing constraint violations

## Quick Start

### Prerequisites
- **Node.js** >= 18 (tested with Node 20/22)
- **MongoDB** (local or Atlas cloud)

### Installation & Setup

1. **Clone or navigate to project**:
   ```bash
   cd Schedulo
   ```

2. **Start MongoDB** (Windows):
   ```powershell
   net start MongoDB
   # Or check Services > MongoDB Server
   ```

3. **Setup Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   Should print: `Database connected successfully` and `Server running at http://localhost:3001`

4. **Setup Frontend** (in a new terminal):
   ```bash
   cd client
   npm install
   npm start
   ```
   Opens http://localhost:3000 in your browser

5. **Seed Sample Data**:
   ```bash
   cd server
   node sample-seed.js
   ```
   Creates 1 class (CSE-2A), 2 subjects (1 lecture + 1 lab), 2 faculties, 3 rooms, default config

6. **Generate Timetable**:
   - In the browser, click **Generate All Timetables**
   - Or via curl:
     ```bash
     curl -X POST http://localhost:3001/api/timetable/generate-all \
       -H "Content-Type: application/json" \
       -d '{"periodsPerDay":8}'
     ```

7. **View Results**:
   - In the browser, click a class card to view its timetable
   - Check the table for scheduled subjects, faculty, and lab markings (blue background)

## Project Structure

```
Schedulo/
├── server/                          # Node.js + Express backend
│   ├── app.js                       # Express server entry
│   ├── package.json
│   ├── .env.example
│   ├── models/
│   │   ├── connection.js            # MongoDB connection
│   │   ├── Faculty.js
│   │   ├── Subject.js
│   │   ├── ClassRoom.js
│   │   ├── Room.js
│   │   ├── Timetable.js
│   │   └── Config.js
│   ├── controllers/
│   │   ├── faculty.controller.js
│   │   ├── subject.controller.js
│   │   ├── class.controller.js
│   │   ├── room.controller.js
│   │   ├── config.controller.js
│   │   └── timetable.controller.js
│   ├── routes/
│   │   ├── faculty.routes.js
│   │   ├── subject.routes.js
│   │   ├── class.routes.js
│   │   ├── room.routes.js
│   │   ├── config.routes.js
│   │   └── timetable.routes.js
│   ├── services/
│   │   └── global-scheduler.service.js  # Core scheduling engine
│   ├── sample-seed.js               # Sample data seeder
│   └── README.md                    # Server-specific docs
│
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── api.js                   # Centralized API client
│   │   ├── index.js
│   │   ├── index.css                # Tailwind directives
│   │   ├── App.js
│   │   ├── App.css
│   │   └── components/
│   │       ├── Dashboard.jsx        # Main container
│   │       ├── FacultyForm.jsx      # Create faculty + availability editor
│   │       ├── SubjectForm.jsx      # Create subjects
│   │       ├── ClassForm.jsx        # Create classes & assign subjects
│   │       ├── RoomForm.jsx         # Create rooms
│   │       ├── ClassCard.jsx        # Class selector
│   │       ├── TimetableGrid.jsx    # Display timetable table
│   │       ├── DiagnosticsModal.jsx # Error modal with suggestions
│   │       └── AvailabilitySelector.jsx
│   ├── package.json
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── postcss.config.js            # PostCSS config
│   └── README.md
│
└── README.md                        # This file
```

## API Endpoints

### Faculty
- `GET /api/faculty` - List all faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update
- `DELETE /api/faculty/:id` - Delete

### Subjects
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update
- `DELETE /api/subjects/:id` - Delete

### Classes
- `GET /api/classes` - List classes with subjects populated
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update
- `DELETE /api/classes/:id` - Delete

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update
- `DELETE /api/rooms/:id` - Delete

### Config
- `GET /api/config` - Get global timetable config
- `PUT /api/config` - Update config

### Timetable (Scheduling)
- **POST /api/timetable/generate-all** - Run global scheduler
  - Body: `{ periodsPerDay?: 8, days?: ["Mon", ...] }` (optional)
  - Response: `{ success: true, timetables: [...] }` or `{ success: false, error, diagnostics }`
- **GET /api/timetable/all** - List all timetables
- **GET /api/timetable/class/:classId** - Get timetable for one class

## Scheduler Algorithm

### Overview
The scheduler uses **backtracking with MRV (Minimum Remaining Values) heuristic** and **forward-checking** to find a conflict-free timetable.

### Key Steps
1. **Task Generation**: For each class and subject, create tasks (one per session per week)
   - Lectures: length 1
   - Labs: length = `labSizePeriods` (default 2)
2. **Domain Building**: For each task, compute all valid placements
   - Placement = (class, day, start period, room)
   - Validity checks: fits in day, respects breaks, lab start valid, faculty available, teacher/room/class not busy
3. **MRV Heuristic**: Always pick task with smallest domain to assign next
4. **Lab-First**: Sort labs before lectures (more constrained)
5. **Forward-Checking**: After placing a task, remove conflicting placements from remaining domains
6. **Backtracking**: If a task has zero valid placements, backtrack and try another assignment
7. **Attempt Cap**: Stop after 5M attempts to prevent infinite loops
8. **Diagnostics**: On failure, identify problematic tasks and overloaded faculty

### Constraints Enforced
- ✓ No teacher double-booking across any class
- ✓ No room conflicts
- ✓ No class period overlap
- ✓ Lab sessions are exactly 2 periods (configurable) and start only at 1, 3, 5, 7 (1-based)
- ✓ Teacher availability: respect per-day availability array
- ✓ Teacher load: maxPerDay and maxPerWeek limits
- ✓ Subject sessions: exactly sessionsPerWeek scheduled

### Diagnostics on Failure
If scheduling fails, the response includes:
```json
{
  "success": false,
  "error": "Scheduling failed after X attempts...",
  "diagnostics": {
    "totalTasks": 8,
    "labTasks": 2,
    "attempts": 1234567,
    "maxAttempts": 5000000,
    "problematicTasks": [
      {
        "task": "Database Lab",
        "class": "CSE-2A",
        "faculty": "Dr. Bob",
        "reason": "No valid placement found (check availability, load limits, or increase periods)"
      }
    ],
    "overloadedFaculty": [
      {
        "name": "Dr. Alice",
        "requiredSlots": 16,
        "availableSlots": 40,
        "suggestion": "Increase periodsPerDay or reduce subject sessions for this faculty"
      }
    ]
  }
}
```

The frontend displays this in a modal with actionable suggestions.

## Data Models

### Faculty
```javascript
{
  name: String,
  shortName: String,
  availability: { Mon: [1..8], Tue: [...], ... },
  maxLoadPerDay: Number,
  maxLoadPerWeek: Number
}
```

### Subject
```javascript
{
  name: String,
  code: String,
  type: "lecture" | "lab",
  sessionsPerWeek: Number,
  labSizePeriods: Number,
  faculty: ObjectId (Faculty)
}
```

### ClassRoom
```javascript
{
  name: String,
  department: String,
  year: Number,
  section: String,
  subjects: [ObjectId], // Subject IDs
  periodsPerDay: Number,
  days: [String]
}
```

### Room
```javascript
{
  name: String,
  type: "lab" | "classroom",
  capacity: Number
}
```

### Timetable
```javascript
{
  classRoom: ObjectId,
  periods: [
    {
      day: String,
      periodIndex: Number,     // 0-based
      subject: ObjectId,
      faculty: ObjectId,
      room: ObjectId,
      isLab: Boolean
    }
  ],
  generatedAt: Date
}
```

### Config
```javascript
{
  workingDays: [String],
  periodsPerDay: Number,
  periodDurationMinutes: Number,
  breaks: [{ afterPeriod: Number, durationMinutes: Number }],
  labAllowedStarts: [Number]  // 1-based: [1, 3, 5, 7]
}
```

## Running Tests

### Via Frontend
1. Create some faculties, subjects, and a class in the browser
2. Click **Generate All Timetables**
3. Click a class card to see its timetable
4. Verify:
   - No teacher appears twice in the same period (across any class)
   - Lab blocks are 2 periods and only at positions 1-2, 3-4, 5-6, 7-8
   - All subject sessions are scheduled

### Via Curl
```bash
# After running sample-seed.js:

# 1. Generate
curl -X POST http://localhost:3001/api/timetable/generate-all \
  -H "Content-Type: application/json" \
  -d '{"periodsPerDay":8}'

# 2. Get all timetables
curl http://localhost:3001/api/timetable/all

# 3. Check diagnostics (if generation failed)
# The response will show problematicTasks and overloadedFaculty
```

## Environment Configuration

Create `server/.env` (copy from `.env.example`):
```
MONGO_URI=mongodb://127.0.0.1:27017/schedulo
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/schedulo
NODE_ENV=development
PORT=3001
```

## Troubleshooting

### "Database connection error"
- Ensure MongoDB is running: `net start MongoDB`
- Check `MONGO_URI` in `.env`

### "No classes found" when generating
- Run `node sample-seed.js` to create sample data
- Or manually create a class with at least one subject

### Scheduler fails with diagnostics
- **Problematic tasks**: Check faculty availability, increase `sessionsPerWeek`, or add periods
- **Overloaded faculty**: Reduce subject sessions, add more faculties, or increase `maxLoadPerWeek`
- **Insufficient rooms**: Add more lab or classroom rooms in the UI

### Frontend can't reach backend
- Verify backend is running on `http://localhost:3001`
- Check for CORS errors in browser console
- Ensure both are on the same machine or update API_BASE in `client/src/api.js`

## Performance Notes

- Scheduler optimized for ~30 classes / ~400 tasks
- Uses backtracking with forward-checking (NP-hard problem)
- Max 5M attempts prevents timeout
- Labs scheduled first (longer, more constrained)
- Deterministic ordering for reproducibility

For larger institutions, consider:
- Multi-stage scheduling (labs → lectures)
- Incremental constraint relaxation
- Genetic/simulated-annealing approaches (future enhancement)

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Styling | Tailwind CSS | 3.x |
| Backend | Node.js + Express | 20+ / 5.x |
| Database | MongoDB | 6.x+ |
| ODM | Mongoose | 7.x+ |
| Build | Create React App | 5.x |

## License

ISC

## Contributing

To extend or modify:

1. **Backend changes**: Update models/controllers/routes in `server/`
2. **Frontend changes**: Update components in `client/src/components/`
3. **Scheduler tweaks**: Modify `server/services/global-scheduler.service.js`
4. **API integration**: Update `client/src/api.js`

## Support

For issues or questions:
- Check `server/README.md` for backend-specific docs
- Review scheduler algorithm section above
- Check browser console for client errors
- Check server logs for backend errors

---

**Happy scheduling!** 🎓📅