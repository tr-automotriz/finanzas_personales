"use client";

import { useActionState, useEffect, useRef } from "react";
import { createGoal } from "./actions";

export function NewGoalForm() {
  const [state, action, pending] = useActionState(createGoal, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700"
    >
      <input
        name="name"
        placeholder="Nombre de la meta (ej: Fondo de emergencia)"
        required
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="targetAmount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Monto objetivo"
          required
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <input
          name="deadline"
          type="date"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Creando..." : "Crear meta"}
      </button>
    </form>
  );
}
