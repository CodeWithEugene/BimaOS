export function ClaimsChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const approvedData = [12, 18, 15, 22, 19, 8, 11];
  const flaggedData = [4, 6, 3, 7, 5, 2, 3];

  const maxVal = 30; // Max ceiling for scaling

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4">Claims Volume (7 Days)</h3>

      <div className="flex items-end gap-3 h-36">
        {days.map((day, i) => {
          const approvedPercent = (approvedData[i] / maxVal) * 100;
          const flaggedPercent = (flaggedData[i] / maxVal) * 100;
          return (
            <div key={day} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <div className="w-full flex flex-col items-center justify-end h-24 gap-0.5">
                <div
                  className="w-1/2 rounded-t-xs bg-zinc-300 dark:bg-zinc-600 transition-all"
                  style={{ height: `${flaggedPercent}%` }}
                  title={`Flagged: ${flaggedData[i]}`}
                />
                <div
                  className="w-full rounded-xs bg-zinc-900 dark:bg-zinc-100 transition-all"
                  style={{ height: `${approvedPercent}%` }}
                  title={`Approved: ${approvedData[i]}`}
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-xs bg-zinc-900 dark:bg-zinc-100" />
          <span>AI Approved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-xs bg-zinc-300 dark:bg-zinc-600" />
          <span>Flagged for Review</span>
        </div>
      </div>
    </div>
  );
}
