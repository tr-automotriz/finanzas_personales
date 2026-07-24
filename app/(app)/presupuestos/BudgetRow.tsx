"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteBudget, upsertBudget } from "./actions";
import { currency } from "@/lib/format";
import { ProgressBar } from "@/components/ProgressBar";

type Props = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  month: string;
  spent: number;
  budget: { id: string; limitAmount: number } | null;
};

export function BudgetRow({ categoryId, categoryName, categoryColor, month, spent, budget }: Props) {
  const [editing, setEditing] = useState(!budget);
  const [state, action, pending] = useActionState(upsertBudget, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (editing) {
    return (
      <li className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="month" value={month} />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: categoryColor }} />
          <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200">{categoryName}</span>
          <input
            name="limitAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Límite"
            defaultValue={budget?.limitAmount}
            required
            className="w-28 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Guardar
          </button>
          {budget && (
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-zinc-500">
              Cancelar
            </button>
          )}
        </form>
        {state?.error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: categoryColor }} />
          {categoryName}
        </span>
        <span className="text-xs text-zinc-500">
          {currency.format(spent)} / {currency.format(budget!.limitAmount)}
        </span>
      </div>
      <ProgressBar value={spent} max={budget!.limitAmount} />
      <div className="flex gap-3 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          Editar
        </button>
        <form action={deleteBudget}>
          <input type="hidden" name="id" value={budget!.id} />
          <button type="submit" className="text-red-600 hover:text-red-700 dark:text-red-400">
            Quitar límite
          </button>
        </form>
      </div>
    </li>
  );
}
