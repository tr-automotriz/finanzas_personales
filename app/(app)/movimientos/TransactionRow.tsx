"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateTransaction, deleteTransaction } from "./actions";
import { currency } from "@/lib/format";

type Category = { id: string; name: string; type: "income" | "expense"; color: string };
type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  note: string | null;
  categoryId: string;
  category: { name: string; color: string };
};

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: Transaction;
  categories: Category[];
}) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(updateTransaction, undefined);
  const wasUpdating = useRef(false);

  useEffect(() => {
    if (wasUpdating.current && !updating && !updateState?.error) {
      setEditing(false);
    }
    wasUpdating.current = updating;
  }, [updating, updateState]);

  if (editing) {
    const sameType = categories.filter((c) => c.type === transaction.type);
    return (
      <li className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <form action={updateAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={transaction.id} />
          <div className="grid grid-cols-2 gap-2">
            <select
              name="type"
              defaultValue={transaction.type}
              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transaction.amount}
              className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <select
            name="categoryId"
            defaultValue={transaction.categoryId}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            {sameType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            defaultValue={transaction.date}
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            name="note"
            type="text"
            defaultValue={transaction.note ?? ""}
            placeholder="Nota"
            className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          {updateState?.error && <p className="text-xs text-red-600 dark:text-red-400">{updateState.error}</p>}
          <div className="flex gap-2 text-xs">
            <button
              type="submit"
              disabled={updating}
              className="rounded-md bg-zinc-900 px-2 py-1 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: transaction.category.color }}
        />
        <div className="flex flex-col">
          <span className="text-sm text-zinc-800 dark:text-zinc-200">{transaction.category.name}</span>
          <span className="text-xs text-zinc-400">
            {transaction.date}
            {transaction.note ? ` · ${transaction.note}` : ""}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}
          {currency.format(transaction.amount)}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Editar
        </button>
        <form action={deleteTransaction}>
          <input type="hidden" name="id" value={transaction.id} />
          <button type="submit" className="text-xs text-red-600 hover:text-red-700 dark:text-red-400">
            Borrar
          </button>
        </form>
      </div>
    </li>
  );
}
