# Schedulo Backend

Node.js + Express + MongoDB timetable generation service.

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas cloud)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional)
   Create `.env` if you want to override MongoDB URI:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/schedulo
   ```
   Default: `mongodb://127.0.0.1:27017/schedulo`

3. **Start MongoDB locally** (Windows)
   ```powershell
   net start MongoDB
   # or check Services -> MongoDB Server
   ```

4. **Run server in development**
   ```bash
   npm run dev
   ```
   Should print:
   ```
   Database connected successfully (Schedulo)
   Server running at http://localhost:3001
   ```

5. **Seed sample data**
   ```bash
   node sample-seed.js
   ```
   Creates 1 class, 2 subjects (1 lecture, 1 lab), 2 faculties, 3 rooms.

6. **Generate timetable**
   ```bash
   curl -X POST http://localhost:3001/api/timetable/generate-all \
     -H "Content-Type: application/json" \
     -d '{"periodsPerDay":8}'
   ```
   Returns `{ success: true, timetables: [...] }`

7. **View timetable for a class**
   ```bash
   # Replace <CLASS_ID> with ID from seed or class creation
   curl http://localhost:3001/api/timetable/class/<CLASS_ID>
   ```

## API Endpoints

### Faculty
- `GET /api/faculty` - List all faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/:id` - Update
- `DELETE /api/faculty/:id` - Delete

### Subjects
- `GET /api/subjects` - List subjects (with faculty populated)
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update
- `DELETE /api/subjects/:id` - Delete

### Classes
- `GET /api/classes` - List classes (with subjects & faculty populated)
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

### Timetable (Scheduler)
- `POST /api/timetable/generate-all` - Run global scheduler
  - Optional body: `{ periodsPerDay, days }`
  - Returns: `{ success: true, timetables: [...] }` or `{ success: false, error, diagnostics }`
- `GET /api/timetable/all` - List all generated timetables
- `GET /api/timetable/class/:classId` - Get timetable for one class

## Scheduler Algorithm

- **Input**: All classes, subjects, faculties, rooms, availability
- **Algorithm**: Backtracking with MRV (minimum remaining values) heuristic
  - Labs scheduled first (longer duration)
  - Forward-checking to prune domains
  - Max 5M attempts to avoid infinite loops
- **Constraints**:
  - No teacher double-booking
  - No room conflicts
  - No class period conflicts
  - Lab sessions are 2-period blocks at allowed starts (1,3,5,7)
  - Teacher availability & load limits (maxPerDay, maxPerWeek)
  - Subject sessions per week exactly scheduled
- **Output**: Timetable docs in MongoDB with periods array

## Diagnostics

If scheduler fails, returns:
```json
{
  "success": false,
  "error": "...",
  "diagnostics": {
    "totalTasks": 8,
    "labTasks": 2,
    "problematicTasks": [
      {
        "task": "Database Lab",
        "class": "CSE-2A",
        "faculty": "Dr. Bob",
        "reason": "No valid placement (check availability)"
      }
    ],
    "overloadedFaculty": [
      {
        "name": "Dr. Alice",
        "requiredSlots": 16,
        "availableSlots": 40,
        "suggestion": "Increase periodsPerDay or reduce sessions"
      }
    ]
  }
}
```

## Project Structure

```
server/
  app.js               - Express server entry point
  package.json         - Dependencies
  .env.example         - Environment template
  models/
    connection.js      - MongoDB connection
    Faculty.js         - Faculty schema
    Subject.js         - Subject schema
    ClassRoom.js       - Class schema
    Room.js            - Room schema
    Timetable.js       - Timetable schema
    Config.js          - Global config schema
  controllers/
    faculty.controller.js
    subject.controller.js
    class.controller.js
    room.controller.js
    config.controller.js
    timetable.controller.js
  routes/
    faculty.routes.js
    subject.routes.js
    class.routes.js
    room.routes.js
    config.routes.js
    timetable.routes.js
  services/
    global-scheduler.service.js - Core scheduler logic
  sample-seed.js       - Seed database
  README.md            - This file
```

## Models at a Glance

### Faculty
```javascript
{
  name: String,
  shortName: String,
  teaches: [SubjectId],
  assignedClasses: [ClassId],
  availability: { Mon: [1..8], Tue: [1..8], ... },
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
  labSizePeriods: Number (default 2),
  faculty: FacultyId
}
```

### ClassRoom
```javascript
{
  name: String,
  department: String,
  year: Number,
  section: String,
  subjects: [SubjectId],
  periodsPerDay: Number,
  days: [String]
}
```

### Room
```javascript
{
  name: String,
  type: "lab" | "classroom",
  capacity: Number,
  availableFor: [String] (optional)
}
```

### Timetable
```javascript
{
  classRoom: ClassroomId,
  periods: [
    {
      day: String,
      periodIndex: Number (0-based),
      subject: SubjectId,
      faculty: FacultyId,
      room: RoomId,
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
  labAllowedStarts: [Number] // 1-based
}
```

## Troubleshooting

### "Database connection error"
- Ensure MongoDB is running (`net start MongoDB` on Windows)
- Check `MONGO_URI` in `.env`

### "No classes found"
- Run `node sample-seed.js` to create sample data

### Scheduler fails with diagnostics
- Check problematic tasks (missing faculty, insufficient availability)
- Add more rooms if lab rooms are insufficient
- Increase faculty availability or reduce subject sessions

## Testing

```bash
# Start server
npm run dev

# In another terminal, seed data
node sample-seed.js

# Generate timetable
curl -X POST http://localhost:3001/api/timetable/generate-all -H "Content-Type: application/json" -d '{"periodsPerDay":8}'

# View results
curl http://localhost:3001/api/timetable/all
```

## Performance Notes

- Scheduler uses backtracking with forward-checking
- Labs scheduled first (longer, more constrained)
- Max 5M attempts prevents infinite loops
- For >30 classes, consider multi-stage scheduling (future enhancement)

## ESM & Compatibility

- Uses ES module syntax (`import`/`export`)
- Requires `Node >= 18`
- Mongoose v7+ (no deprecated connect options)
- No `useNewUrlParser` or `useUnifiedTopology` needed
