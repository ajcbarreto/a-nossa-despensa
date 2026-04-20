"use client";

import { useState, useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import type { ManualShoppingItem } from "@prisma/client";
import {
  addManualShoppingItem,
  deleteManualItem,
  toggleManualItemDone,
} from "@/actions/manual-items";
import { QuantityStepper } from "@/components/QuantityStepper";

type Props = { items: ManualShoppingItem[] };

export function ManualShoppingSection({ items }: Props) {
  const [pending, startTransition] = useTransition();
  const [manualQty, setManualQty] = useState(1);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
        Lista manual
      </h2>
      <form
        className="flex flex-col gap-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
        action={(fd) =>
          startTransition(async () => {
            await addManualShoppingItem({
              title: String(fd.get("title") ?? ""),
              quantity: Number(fd.get("quantity") ?? 1),
            });
            setManualQty(1);
          })
        }
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]">
            Item
          </span>
          <input
            name="title"
            required
            placeholder="Ex.: Pão, Leite..."
            className="min-h-[3rem] w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 text-base text-[color:var(--foreground)] shadow-sm outline-none ring-[color:var(--accent)] placeholder:text-[color:var(--muted)] focus:ring-2"
          />
        </label>

        <div className="rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] p-3 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]">
            Quantidade
          </p>
          <input type="hidden" name="quantity" value={manualQty} readOnly />
          <QuantityStepper
            value={manualQty}
            onChange={setManualQty}
            min={1}
            disabled={pending}
            className="w-full max-w-[16rem]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-5 text-base font-bold text-[color:var(--accent-foreground)] shadow-[0_4px_14px_-2px_rgba(47,125,78,0.35)] transition hover:brightness-105 disabled:opacity-50 sm:w-auto sm:self-start"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-3 shadow-sm shadow-stone-400/10"
          >
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => toggleManualItemDone({ id: it.id }))
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--input-bg)] text-[color:var(--foreground)] transition hover:bg-stone-200/80"
              aria-pressed={it.isDone}
              aria-label={it.isDone ? "Marcar por fazer" : "Marcar feito"}
            >
              <Check
                className={`h-6 w-6 ${it.isDone ? "text-[color:var(--accent)]" : "opacity-40"}`}
              />
            </button>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p
                className={`text-base font-semibold leading-snug ${it.isDone ? "text-[color:var(--muted)] line-through" : "text-[color:var(--foreground)]"}`}
              >
                {it.title}
              </p>
              <p
                className={`text-sm font-bold tabular-nums ${
                  it.isDone ? "text-[color:var(--muted)]" : "text-[color:var(--foreground)]"
                }`}
              >
                Quantidade: {it.quantity}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => deleteManualItem({ id: it.id }))
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-rose-600 hover:bg-rose-100"
              aria-label="Apagar item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-[color:var(--border-strong)] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
            Nenhum item extra. Usa o formulário acima no supermercado.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
