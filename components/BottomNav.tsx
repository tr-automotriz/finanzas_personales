"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio", icon: "📊" },
  { href: "/movimientos", label: "Movim.", icon: "📋" },
  { href: "/nuevo", label: "Agregar", icon: "➕" },
  { href: "/presupuestos", label: "Presup.", icon: "🎯" },
  { href: "/metas", label: "Metas", icon: "🏆" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isAdd = item.href === "/nuevo";
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <span
                  className={`flex items-center justify-center text-lg ${
                    isAdd
                      ? "-mt-4 h-11 w-11 rounded-full bg-zinc-900 text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900"
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                {!isAdd && item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
