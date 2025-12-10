// src/components/ClassCard.jsx
export default function ClassCard({ cls, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(cls)}
      className={`p-4 bg-white rounded-lg shadow border-2 cursor-pointer transition ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <h3 className="font-bold text-lg">{cls.name}</h3>
      {cls.department && <p className="text-sm text-gray-600">{cls.department}</p>}
      <p className="text-sm text-gray-500 mt-1">Year {cls.year}, Section {cls.section}</p>
      <p className="text-xs text-gray-600 mt-2">
        {cls.subjects?.length || 0} subject(s)
      </p>
      <div className="mt-3 text-xs text-blue-600">
        {isSelected ? "Showing timetable below" : "Click to view timetable"}
      </div>
    </div>
  );
}
