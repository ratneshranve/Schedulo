// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import DepartmentForm from "./DepartmentForm";
import FacultyForm from "./FacultyForm";
import SubjectForm from "./SubjectForm";
import ClassForm from "./ClassForm";
import RoomForm from "./RoomForm";
import ConfigForm from "./ConfigForm";
import ClassCard from "./ClassCard";
import TimetableGrid from "./TimetableGrid";
import FacultyTimetableView from "./FacultyTimetableView";
import PrintableTimetable from "./PrintableTimetable";
import DiagnosticsModal from "./DiagnosticsModal";

export default function Dashboard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedPrintClass, setSelectedPrintClass] = useState(null);
  const [selectedPrintFaculty, setSelectedPrintFaculty] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const reload = async () => {
    try {
      const [classList, facultyList, deptList, cfg] = await Promise.all([
        api.getClasses(),
        api.getFaculty(),
        api.getDepartments(),
        api.getConfig()
      ]);
      setClasses(classList);
      setFaculties(facultyList);
      setDepartments(deptList);
      setConfig(cfg);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setGenerationSuccess(false);
    try {
      const res = await api.generateAll({ periodsPerDay: 8 });
      if (res.success) {
        setGenerationSuccess(true);
        setTimeout(() => setCurrentStep(8), 1500);
        reload();
      } else {
        // Pass the entire error object to DiagnosticsModal
        setError(res);
      }
    } catch (err) {
      // Convert error to object format
      setError({
        error: typeof err === 'string' ? err : err.message || JSON.stringify(err),
        diagnostics: err.diagnostics || null
      });
      console.error("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, title: "Departments", desc: "Create departments" },
    { num: 2, title: "Faculty", desc: "Add faculty members" },
    { num: 3, title: "Rooms", desc: "Add classrooms & labs" },
    { num: 4, title: "Subjects", desc: "Create subjects" },
    { num: 5, title: "Classes", desc: "Create classes" },
    { num: 6, title: "Configuration", desc: "System settings" },
    { num: 7, title: "Generate", desc: "Create timetables" },
    { num: 8, title: "View Timetables", desc: "See results" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6">
        <h1 className="text-3xl font-bold">Schedulo - Timetable Generator</h1>
        <p className="text-blue-200">Complete college timetable generation system</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center cursor-pointer ${
                  currentStep >= step.num ? "opacity-100" : "opacity-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-1 ${
                    currentStep === step.num
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : currentStep > step.num
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                >
                  {currentStep > step.num ? "✓" : step.num}
                </div>
                <span className="text-xs font-semibold">{step.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step.num ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Step 1: Departments */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 1: Create Departments</h2>
              <p className="text-gray-600">Create departments that will contain classes.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <DepartmentForm onCreated={reload} />
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-4">Departments Created</h3>
                {departments && departments.length > 0 ? (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div key={dept._id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <div className="font-semibold">{dept.name}</div>
                        <div className="text-sm text-gray-600">Code: {dept.code}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No departments created yet.</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
            >
              Next: Add Faculty →
            </button>
          </div>
        )}

        {/* Step 2: Faculty */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 2: Add Faculty Members</h2>
              <p className="text-gray-600">Create faculty members with their availability and load limits.</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <FacultyForm onCreated={reload} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Next: Add Rooms →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rooms */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 3: Add Classrooms & Labs</h2>
              <p className="text-gray-600">Create rooms (classrooms for lectures, labs for practical sessions).</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <RoomForm onCreated={reload} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Next: Add Subjects →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Subjects */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 4: Create Subjects</h2>
              <p className="text-gray-600">Define subjects with their type (lecture/lab), sessions per week, and assigned faculty.</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <SubjectForm onCreated={reload} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Next: Create Classes →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Classes */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 5: Create Classes</h2>
              <p className="text-gray-600">Create classes by selecting department, year, and section, then assign subjects.</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <ClassForm onCreated={reload} />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(6)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Next: System Configuration →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Configuration */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 6: System Configuration</h2>
              <p className="text-gray-600">Configure institute timings, breaks, and constraints.</p>
            </div>
            <ConfigForm onCreated={reload} />
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(5)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(7)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Next: Generate Timetables →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Generate */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 7: Generate Timetables</h2>
              <p className="text-gray-600">Click the button below to generate conflict-free timetables for all classes and faculty.</p>
            </div>
            <div className="bg-white p-8 rounded shadow text-center">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`px-12 py-4 rounded font-bold text-lg text-white ${
                  generating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {generating ? "Generating Timetables..." : "Generate All Timetables"}
              </button>
              {generationSuccess && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                  ✓ Timetables generated successfully!
                </div>
              )}
            </div>
            {error && <DiagnosticsModal error={error} onClose={() => setError(null)} />}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(6)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step 8: View Timetables */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Step 8: View Timetables</h2>
              <p className="text-gray-600">Browse generated class and faculty timetables.</p>
            </div>

            {/* Class Timetables */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Class Timetables</h3>
              <div className="grid grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <ClassCard
                    key={cls._id}
                    cls={cls}
                    isSelected={selectedClass?._id === cls._id}
                    onSelect={setSelectedClass}
                  />
                ))}
              </div>
            </div>

            {selectedClass && (
              <div className="bg-white p-6 rounded shadow space-y-4">
                <h3 className="text-lg font-bold">Timetable: {selectedClass.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <div />
                  <div>
                    <button
                      onClick={() => setSelectedPrintClass(selectedClass)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
                    >
                      Printable / PDF
                    </button>
                    <button
                      onClick={() => setSelectedClass(null)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <TimetableGrid classId={selectedClass._id} />
              </div>
            )}

            {/* Faculty Timetables */}
            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-bold">Faculty Timetables</h3>
              <div className="grid grid-cols-3 gap-4">
                {faculties.map((fac) => (
                  <div
                    key={fac._id}
                    onClick={() => setSelectedFaculty(fac)}
                    className={`p-4 rounded cursor-pointer border-2 transition ${
                      selectedFaculty?._id === fac._id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-bold">{fac.name}</div>
                    <div className="text-sm text-gray-600">{fac.email}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedFaculty && (
              <div className="bg-white p-6 rounded shadow space-y-4">
                <h3 className="text-lg font-bold">Timetable: {selectedFaculty.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <div />
                  <div>
                    <button
                      onClick={() => setSelectedPrintFaculty(selectedFaculty)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded mr-2"
                    >
                      Printable / PDF
                    </button>
                    <button
                      onClick={() => setSelectedFaculty(null)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <FacultyTimetableView facultyId={selectedFaculty._id} />
              </div>
            )}

            {selectedPrintClass && (
              <div className="bg-white p-6 rounded shadow">
                <PrintableTimetable
                  type="class"
                  referenceId={selectedPrintClass._id}
                  referenceName={selectedPrintClass.name}
                  config={config}
                />
              </div>
            )}

            {selectedPrintFaculty && (
              <div className="bg-white p-6 rounded shadow">
                <PrintableTimetable
                  type="faculty"
                  referenceId={selectedPrintFaculty._id}
                  referenceName={selectedPrintFaculty.name}
                  config={config}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(7)}
                className="bg-gray-600 text-white px-6 py-3 rounded font-semibold hover:bg-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
