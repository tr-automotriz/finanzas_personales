"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { contributeToGoal, deleteGoal } from "./actions";
import { currency } from "@/lib/format";
import { ProgressBar } from "@/components/ProgressBar";
import { todayLocalISODate } from "@/lib/dates";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
};

export function GoalCard({ goal }: { goal: Goal }) {
  const [contributing, setContributing] = useState(false);
  const [state, action, pending] = useActionState(contributeToGoal, undefined);
  const reached = goal.currentAmount >= goal.targetAmount;
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setContributing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{goal.name}</p>
          {goal.deadline && <p className="text-xs text-zinc-400">Fecha límite: {goal.deadline}</p>}
        </div>
        <form action={deleteGoal}>
          <input type="hidden" name="id" value={goal.id} />
          <button type="submit" className="text-xs text-red-600 hover:text-red-700 dark:text-red-400">
            Borrar
          </button>
        </form>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-zinc-500">
          {currency.format(goal.currentAmount)} / {currency.format(goal.targetAmount)}
        </span>
        {reached && <span className="font-medium text-teal-600 dark:text-teal-400">¡Meta cumplida!</span>}
      </div>
      <ProgressBar value={goal.currentAmount} max={goal.targetAmount} colorClass="bg-teal-500" />

      {contributing ? (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <input type="hidden" name="date" value={todayLocalISODate()} />
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto"
            required
            autoFocus
            className="w-24 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Aportar
          </button>
          <button type="button" onClick={() => setContributing(false)} className="text-xs text-zinc-500">
            Cancelar
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setContributing(true)}
          className="self-start text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
        >
          + Aportar
        </button>
      )}
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </li>
  );
}
