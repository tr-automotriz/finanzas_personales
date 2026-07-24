"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createTransaction } from "./actions";

type Category = { id: string; name: string; type: "income" | "expense"; color: string };

export function NewTransactionForm({
  categories,
  today,
}: {
  categories: Category[];
  today: string;
}) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [state, action, pending] = useActionState(createTransaction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-red-600 text-white"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-green-600 text-white"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Ingreso
        </button>
      </div>
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Monto
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          autoFocus
          placeholder="0.00"
          className="rounded-lg border border-zinc-300 px-3 py-3 text-2xl font-semibold outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Fecha
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={today}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nota (opcional)
        </label>
        <input
          id="note"
          name="note"
          type="text"
          maxLength={200}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Movimiento guardado.</p>
      )}

      <button
        type="submit"
        disabled={pending || filteredCategories.length === 0}
        className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
      {filteredCategories.length === 0 && (
        <p className="text-xs text-zinc-400">
          No hay categorías de este tipo todavía. Creá una en la sección Categorías.
        </p>
      )}
    </form>
  );
}
