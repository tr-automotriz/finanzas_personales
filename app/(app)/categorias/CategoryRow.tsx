"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteCategory, updateCategory } from "./actions";

type Category = { id: string; name: string; type: "income" | "expense"; color: string };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updating] = useActionState(updateCategory, undefined);
  const [deleteState, deleteAction, deleting] = useActionState(deleteCategory, undefined);
  const wasUpdating = useRef(false);

  useEffect(() => {
    if (wasUpdating.current && !updating && !updateState?.error) {
      setEditing(false);
    }
    wasUpdating.current = updating;
  }, [updating, updateState]);

  if (editing) {
    return (
      <li className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <form action={updateAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="type" value={category.type} />
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="color"
              defaultValue={category.color}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
            />
            <input
              name="name"
              defaultValue={category.name}
              className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
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
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
        <span className="text-sm text-zinc-800 dark:text-zinc-200">{category.name}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Editar
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={category.id} />
          <button type="submit" disabled={deleting} className="text-red-600 hover:text-red-700 dark:text-red-400">
            Borrar
          </button>
        </form>
      </div>
      {deleteState?.error && (
        <p className="basis-full text-xs text-red-600 dark:text-red-400">{deleteState.error}</p>
      )}
    </li>
  );
}
