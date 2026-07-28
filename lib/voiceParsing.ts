const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

const INCOME_HINTS = ["cobre", "ingreso", "me pagaron", "sueldo", "deposito", "transferencia recibida"];

// El peso chileno (CLP) no usa decimales: los billetes son $1.000, $2.000, $5.000,
// $10.000 y $20.000. Por eso "." y "," en un monto dictado son siempre separadores
// de miles (ej. "10.000" = diez mil), nunca un decimal.
function parseClpDigits(raw: string): number | null {
  const digits = raw.replace(/[.,]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

const NUMBER_WORDS: Record<string, number> = {
  cero: 0,
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiun: 21,
  veintiuno: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
  cien: 100,
  ciento: 100,
  doscientos: 200,
  trescientos: 300,
  cuatrocientos: 400,
  quinientos: 500,
  seiscientos: 600,
  setecientos: 700,
  ochocientos: 800,
  novecientos: 900,
};

// "lucas" y "palos" son jerga chilena muy común para hablar de plata:
// una luca = $1.000, un palo = $1.000.000.
const MULTIPLIER_WORDS: Record<string, number> = {
  mil: 1_000,
  luca: 1_000,
  lucas: 1_000,
  millon: 1_000_000,
  millones: 1_000_000,
  palo: 1_000_000,
  palos: 1_000_000,
};

function isNumberWordToken(token: string): boolean {
  return token in NUMBER_WORDS || token in MULTIPLIER_WORDS;
}

function extractWordAmount(text: string): number | null {
  const words = normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < words.length) {
    if (!isNumberWordToken(words[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < words.length) {
      if (isNumberWordToken(words[j])) {
        j++;
        continue;
      }
      if (words[j] === "y" && j + 1 < words.length && isNumberWordToken(words[j + 1])) {
        j++;
        continue;
      }
      break;
    }
    if (j - i > bestLen) {
      bestLen = j - i;
      bestStart = i;
    }
    i = j;
  }

  if (bestStart === -1) return null;

  let total = 0;
  let current = 0;
  for (const token of words.slice(bestStart, bestStart + bestLen)) {
    if (token === "y") continue;
    if (token in MULTIPLIER_WORDS) {
      const multiplier = MULTIPLIER_WORDS[token];
      total += (current || 1) * multiplier;
      current = 0;
    } else {
      current += NUMBER_WORDS[token];
    }
  }
  total += current;

  return total > 0 ? total : null;
}

export function extractAmount(text: string): number | null {
  const digitMatch = text.match(/\d(?:[\d.,]*\d)?/);
  if (digitMatch) {
    const parsed = parseClpDigits(digitMatch[0]);
    if (parsed !== null) return parsed;
  }
  return extractWordAmount(text);
}

export function detectType(text: string): "income" | "expense" {
  const normalized = normalize(text);
  return INCOME_HINTS.some((hint) => normalized.includes(normalize(hint))) ? "income" : "expense";
}

export function detectCategoryName(text: string, categoryNames: string[]): string | null {
  const normalized = normalize(text);
  const match = categoryNames.find((name) => normalized.includes(normalize(name)));
  return match ?? null;
}
