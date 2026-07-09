export function ClaimsChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const approvedData = [12, 18, 15, 22, 19, 8, 11];
  const flaggedData = [4, 6, 3, 7, 5, 2, 3];

  const maxVal = Math.max(...approvedData);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4">Claims Volume (7 Days)</h3>

      <div className="flex items-end gap-2 h-40">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center gap-0.5">
              <div
                className="w-3/4 rounded-t-sm bg-zinc-300 dark:bg-zinc-600 transition-all"
                style={{ height: `${(flaggedData[i] / maxVal) * 100}%` }}
              />
              <div
                className="w-full rounded-sm bg-zinc-900 dark:bg-zinc-100 transition-all"
                style={{ height: `${(approvedData[i] / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{day}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-zinc-900 dark:bg-zinc-100" />
          <span>AI Approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
          <span>Flagged for Review</span>
        </div>
      </div>
    </div>
  );
}
