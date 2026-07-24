export function ProgressBar({ value, max, colorClass }: { value: number; max: number; colorClass?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const over = max > 0 && value > max;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : colorClass ?? "bg-zinc-900 dark:bg-zinc-100"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
