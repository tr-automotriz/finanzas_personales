"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currency } from "@/lib/format";

type Point = { month: string; income: number; expense: number };

export function MonthlyTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(m: string) => m.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(value) => currency.format(Number(value))} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="income" name="Ingresos" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="expense" name="Gastos" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
