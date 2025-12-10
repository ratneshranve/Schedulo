export default function DiagnosticsModal({ error, onClose }) {
  if (!error) return null;

  const { diagnostics, error: errorMessage } = error;

  const safeStringify = (val) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val === null || val === undefined) return 'N/A';
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl max-h-96 overflow-y-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Scheduling Failed</h2>
        <p className="text-gray-700 mb-4">
          {safeStringify(errorMessage)}
        </p>

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
              {diagnostics.elapsedTime && (
                <p className="text-sm text-gray-600">
                  Time: {diagnostics.elapsedTime}ms
                </p>
              )}
            </div>

            {diagnostics.problematicTasks && diagnostics.problematicTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-red-600 mb-2">Problematic Tasks (first 10):</h3>
                <div className="bg-red-50 border border-red-300 rounded p-3 text-xs space-y-2 max-h-40 overflow-y-auto">
                  {diagnostics.problematicTasks.map((t, i) => (
                    <div key={i} className="text-gray-700">
                      <strong>{safeStringify(t.task || t.subject)}</strong> in {safeStringify(t.class || 'unknown')}: {safeStringify(t.reason || t.faculty)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagnostics.facultyStatus && diagnostics.facultyStatus.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-orange-600 mb-2">Faculty Status:</h3>
                <div className="bg-orange-50 border border-orange-300 rounded p-3 text-xs space-y-2 max-h-40 overflow-y-auto">
                  {diagnostics.facultyStatus.map((f, i) => (
                    <div key={i} className="text-gray-700">
                      <strong>{safeStringify(f.name)}</strong>: {safeStringify(f.requiredSlots)}/{safeStringify(f.availableSlots)} slots needed/available
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagnostics.suggestion && (
              <div className="bg-blue-50 border border-blue-300 rounded p-3 text-xs text-blue-900">
                <strong>Suggestion:</strong> {safeStringify(diagnostics.suggestion)}
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
