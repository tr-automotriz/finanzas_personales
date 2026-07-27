import { parseAmount } from "@/lib/csv";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

const INCOME_HINTS = ["cobre", "ingreso", "me pagaron", "sueldo", "deposito", "transferencia recibida"];

export function extractAmount(text: string): number | null {
  const match = text.match(/\d(?:[\d.,]*\d)?/);
  if (!match) return null;
  return parseAmount(match[0]);
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
