"use client";

import { useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import type { ManualShoppingItem } from "@prisma/client";
import {
  addManualShoppingItem,
  deleteManualItem,
  toggleManualItemDone,
} from "@/actions/manual-items";

type Props = { items: ManualShoppingItem[] };

export function ManualShoppingSection({ items }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Lista manual
      </h2>
      <form
        className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-end"
        action={(fd) =>
          startTransition(async () => {
            await addManualShoppingItem({
              title: String(fd.get("title") ?? ""),
              quantity: Number(fd.get("quantity") ?? 1),
              unit: String(fd.get("unit") ?? "un"),
            });
          })
        }
      >
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
          Item
          <input
            name="title"
            required
            placeholder="Ex.: Pão, Leite..."
            className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Qtd
            <input
              name="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Un.
            <input
              name="unit"
              defaultValue="un"
              className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[color:var(--surface-elevated)] px-3 py-3"
          >
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => toggleManualItemDone({ id: it.id }))
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
              aria-pressed={it.isDone}
              aria-label={it.isDone ? "Marcar por fazer" : "Marcar feito"}
            >
              <Check
                className={`h-6 w-6 ${it.isDone ? "text-[color:var(--accent)]" : "opacity-40"}`}
              />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${it.isDone ? "text-[color:var(--muted)] line-through" : "text-white"}`}
              >
                {it.title}
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                {it.quantity} {it.unit}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => deleteManualItem({ id: it.id }))
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-rose-300/90 hover:bg-rose-500/15"
              aria-label="Apagar item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[color:var(--muted)]">
            Nenhum item extra. Usa o formulário acima no supermercado.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
