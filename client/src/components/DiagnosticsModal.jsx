export default function DiagnosticsModal({ error, onClose }) {
  if (!error) return null;

  const { diagnostics } = error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl max-h-96 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Scheduling Failed</h2>
        <p className="text-gray-700 mb-4">{error.error}</p>

        {diagnostics && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Summary:</h3>
              <p className="text-sm text-gray-600">
                Total tasks: {diagnostics.totalTasks || 0} | Labs: {diagnostics.labTasks || 0}
              </p>
              <p className="text-sm text-gray-600">
                Attempts: {diagnostics.attempts || 0} / {diagnostics.maxAttempts || 5000000}
              </p>
            </div>

            {diagnostics.problematicTasks && diagnostics.problematicTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-red-600 mb-2">Problematic Tasks:</h3>
                <div className="bg-red-50 border border-red-300 rounded p-3 text-xs space-y-1">
                  {diagnostics.problematicTasks.map((t, i) => (
                    <div key={i}>
                      <strong>{t.subject}</strong> ({t.class}, {t.faculty}): {t.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagnostics.overloadedFaculty && diagnostics.overloadedFaculty.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-orange-600 mb-2">Overloaded Faculty:</h3>
                <div className="bg-orange-50 border border-orange-300 rounded p-3 text-xs space-y-1">
                  {diagnostics.overloadedFaculty.map((f, i) => (
                    <div key={i}>
                      <strong>{f.name}</strong>: needs {f.requiredSlots} slots, only {f.availableSlots} available.
                      <p className="text-gray-600">{f.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
