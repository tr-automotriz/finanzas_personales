export function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let s = trimmed.replace(/[^0-9,.\-]/g, "");
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(",", ".");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export type DateFormat = "YMD" | "DMY" | "MDY";

export function parseCsvDate(raw: string, format: DateFormat): string | null {
  const trimmed = raw.trim();
  const parts = trimmed.split(/[/\-.]/).map((p) => p.trim());
  if (parts.length !== 3) return null;

  let year: number;
  let month: number;
  let day: number;

  if (format === "YMD") {
    [year, month, day] = parts.map(Number);
  } else if (format === "DMY") {
    [day, month, year] = parts.map(Number);
  } else {
    [month, day, year] = parts.map(Number);
  }

  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
