"use client";

import { useState, useTransition } from "react";
import { Minus, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { ProductThumb } from "@/components/ProductThumb";
import type { Product } from "@prisma/client";
import {
  adjustQuantity,
  deleteProduct,
  updateIdealAndUnit,
} from "@/actions/products";
import { isBelowIdeal, unitsToIdeal } from "@/lib/shopping";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const need = unitsToIdeal(product.quantity, product.idealStock);
  const low = isBelowIdeal(product.quantity, product.idealStock);
  const ratio =
    product.idealStock > 0
      ? Math.min(100, (product.quantity / product.idealStock) * 100)
      : 100;

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--surface-elevated)] p-4 shadow-lg shadow-black/20">
      <div className="flex gap-4">
        <ProductThumb
          imageUrl={product.imageUrl}
          className="h-24 w-24"
          icon={Package}
          iconClassName="h-10 w-10"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold leading-tight text-white">
            {product.name}
          </h2>
          {product.brand ? (
            <p className="mt-0.5 truncate text-sm text-[color:var(--muted)]">
              {product.brand}
            </p>
          ) : null}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-emerald-300/90 transition-[width]"
              style={{ width: `${ratio}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            <span className="font-medium text-white">{product.quantity}</span>
            <span className="mx-1">/</span>
            <span>{product.idealStock}</span>
            <span className="ml-1 text-xs uppercase">{product.unit}</span>
            {low ? (
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                Faltam {need}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() => adjustQuantity({ id: product.id, delta: -1 }))
          }
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15 active:scale-95 disabled:opacity-50"
          aria-label="Retirar uma unidade"
        >
          <Minus className="h-6 w-6" />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => adjustQuantity({ id: product.id, delta: 1 }))}
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-lg shadow-emerald-900/40 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          aria-label="Adicionar uma unidade"
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="ml-auto inline-flex min-h-[3rem] items-center gap-2 rounded-2xl border border-white/15 px-4 text-sm font-medium text-white/90 transition hover:bg-white/5"
        >
          <Pencil className="h-5 w-5" />
          Ideal
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                `Remover "${product.name}" da despensa?`,
              )
            )
              return;
            run(() => deleteProduct({ id: product.id }));
          }}
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl text-rose-300/90 transition hover:bg-rose-500/15 active:scale-95 disabled:opacity-50"
          aria-label="Remover produto"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {editing ? (
        <form
          key={`${product.idealStock}-${product.unit}`}
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
          action={(fd) => {
            const nextIdeal = Number(fd.get("idealStock"));
            const nextUnit = String(fd.get("unit") || "un");
            run(async () => {
              await updateIdealAndUnit({
                id: product.id,
                idealStock: nextIdeal,
                unit: nextUnit,
              });
              setEditing(false);
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
              Stock ideal
              <input
                name="idealStock"
                type="number"
                min={0}
                defaultValue={product.idealStock}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
              Unidade
              <input
                name="unit"
                defaultValue={product.unit}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="min-h-[3rem] rounded-2xl bg-white/10 font-semibold text-white transition hover:bg-white/15"
          >
            Guardar
          </button>
        </form>
      ) : null}
    </article>
  );
}
