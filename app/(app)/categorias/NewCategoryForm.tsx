"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory } from "./actions";

export function NewCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
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
      <div className="flex gap-2">
        <input
          type="color"
          name="color"
          defaultValue="#6366f1"
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
        />
        <input
          name="name"
          placeholder="Nueva categoría"
          required
          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <select
          name="type"
          className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          defaultValue="expense"
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </div>
      {state?.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Agregando..." : "Agregar categoría"}
      </button>
    </form>
  );
}
