import React from "react";
import Dashboard from "./components/Dashboard";

export default function App(){
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-semibold">Schedulo — Timetable Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Dashboard />
      </main>
    </div>
  );
}
