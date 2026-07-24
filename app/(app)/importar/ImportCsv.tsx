"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { parseAmount, parseCsvDate, type DateFormat } from "@/lib/csv";
import { importTransactions } from "./actions";

type Category = { id: string; name: string; type: "income" | "expense"; color: string };
type SignMode = "auto" | "expense" | "income";

type ParsedRow = {
  date: string | null;
  amount: number | null;
  type: "income" | "expense";
  categoryId: string | null;
  note: string;
};

export function ImportCsv({ categories }: { categories: Category[] }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [dateCol, setDateCol] = useState("");
  const [amountCol, setAmountCol] = useState("");
  const [descCol, setDescCol] = useState("");
  const [dateFormat, setDateFormat] = useState<DateFormat>("DMY");
  const [signMode, setSignMode] = useState<SignMode>("auto");

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const defaultExpenseCategory =
    expenseCategories.find((c) => c.name === "Sin categorizar") ?? expenseCategories[0];
  const [expenseCategoryId, setExpenseCategoryId] = useState(defaultExpenseCategory?.id ?? "");
  const [incomeCategoryId, setIncomeCategoryId] = useState(incomeCategories[0]?.id ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ error?: string; imported?: number } | null>(null);

  function handleFile(file: File) {
    setResult(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const fields = res.meta.fields ?? [];
        setHeaders(fields);
        setRawRows(res.data);
        setDateCol(fields.find((f) => /fecha|date/i.test(f)) ?? fields[0] ?? "");
        setAmountCol(fields.find((f) => /monto|amount|importe/i.test(f)) ?? fields[1] ?? "");
        setDescCol(fields.find((f) => /desc|concepto|detalle/i.test(f)) ?? "");
      },
    });
  }

  const parsedRows: ParsedRow[] = useMemo(() => {
    if (!dateCol || !amountCol) return [];
    return rawRows.map((row) => {
      const rawAmount = parseAmount(row[amountCol] ?? "");
      const date = parseCsvDate(row[dateCol] ?? "", dateFormat);
      let type: "income" | "expense" = "expense";
      let amount = rawAmount;
      if (rawAmount !== null) {
        if (signMode === "auto") {
          type = rawAmount < 0 ? "expense" : "income";
          amount = Math.abs(rawAmount);
        } else {
          type = signMode;
          amount = Math.abs(rawAmount);
        }
      }
      const categoryId = type === "income" ? incomeCategoryId : expenseCategoryId;
      return {
        date,
        amount,
        type,
        categoryId: categoryId || null,
        note: descCol ? (row[descCol] ?? "").slice(0, 200) : "",
      };
    });
  }, [rawRows, dateCol, amountCol, descCol, dateFormat, signMode, incomeCategoryId, expenseCategoryId]);

  const validRows = parsedRows.filter((r) => r.date && r.amount !== null && r.categoryId);
  const invalidCount = parsedRows.length - validRows.length;

  async function handleConfirm() {
    setSubmitting(true);
    setResult(null);
    const payload = validRows.map((r) => ({
      date: r.date!,
      amount: r.amount!,
      type: r.type,
      categoryId: r.categoryId!,
      note: r.note,
    }));
    const res = await importTransactions(payload);
    setResult(res);
    setSubmitting(false);
    if (res.imported) {
      setRawRows([]);
      setHeaders([]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Archivo CSV del banco</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="text-sm"
          />
        </label>
      </div>

      {result?.error && <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>}
      {result?.imported !== undefined && !result.error && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Se importaron {result.imported} movimiento(s).
        </p>
      )}

      {headers.length > 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Columna de fecha
                <select
                  value={dateCol}
                  onChange={(e) => setDateCol(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Formato de fecha
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <option value="DMY">DD/MM/AAAA</option>
                  <option value="YMD">AAAA-MM-DD</option>
                  <option value="MDY">MM/DD/AAAA</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Columna de monto
                <select
                  value={amountCol}
                  onChange={(e) => setAmountCol(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Tipo según el monto
                <select
                  value={signMode}
                  onChange={(e) => setSignMode(e.target.value as SignMode)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <option value="auto">Auto (negativo=gasto, positivo=ingreso)</option>
                  <option value="expense">Todo es gasto</option>
                  <option value="income">Todo es ingreso</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Columna de descripción (opcional)
              <select
                value={descCol}
                onChange={(e) => setDescCol(e.target.value)}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">Ninguna</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Categoría para gastos
                <select
                  value={expenseCategoryId}
                  onChange={(e) => setExpenseCategoryId(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Categoría para ingresos
                <select
                  value={incomeCategoryId}
                  onChange={(e) => setIncomeCategoryId(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {incomeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400">
              {validRows.length} fila(s) listas para importar
              {invalidCount > 0 ? ` · ${invalidCount} con datos inválidos (se ignoran)` : ""}
            </p>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-2 py-1.5">Fecha</th>
                    <th className="px-2 py-1.5">Tipo</th>
                    <th className="px-2 py-1.5">Monto</th>
                    <th className="px-2 py-1.5">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-2 py-1.5">{r.date ?? "—"}</td>
                      <td className="px-2 py-1.5">{r.type === "income" ? "Ingreso" : "Gasto"}</td>
                      <td className="px-2 py-1.5">{r.amount ?? "—"}</td>
                      <td className="max-w-[140px] truncate px-2 py-1.5">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || validRows.length === 0}
              className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Importando..." : `Importar ${validRows.length} movimiento(s)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
