import Link from "next/link";
import { logout } from "@/app/(app)/actions";

export function Header({ email }: { email: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <Link href="/" className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Mis Finanzas
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link href="/categorias" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Categorías
        </Link>
        <Link href="/importar" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Importar
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title={email}
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
