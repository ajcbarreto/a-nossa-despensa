"use client";

import { useEffect, useState, useTransition } from "react";
import { Minus, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { ProductThumb } from "@/components/ProductThumb";
import { ProductImageInput } from "@/components/ProductImageInput";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { Product } from "@prisma/client";
import {
  adjustQuantity,
  deleteProduct,
  updateProduct,
} from "@/actions/products";
import { isBelowIdeal, unitsToIdeal } from "@/lib/shopping";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [editQty, setEditQty] = useState(product.quantity);
  const [editIdeal, setEditIdeal] = useState(product.idealStock);

  const need = unitsToIdeal(product.quantity, product.idealStock);
  const low = isBelowIdeal(product.quantity, product.idealStock);
  const ratio =
    product.idealStock > 0
      ? Math.min(100, (product.quantity / product.idealStock) * 100)
      : 100;

  useEffect(() => {
    if (editing) {
      setImageUrl(product.imageUrl ?? "");
      setEditQty(product.quantity);
      setEditIdeal(product.idealStock);
    }
  }, [editing, product]);

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-lg shadow-stone-400/15">
      <div className="flex gap-4">
        <ProductThumb
          imageUrl={product.imageUrl}
          className="h-24 w-24"
          icon={Package}
          iconClassName="h-10 w-10"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold leading-tight text-[color:var(--foreground)]">
            {product.name}
          </h2>
          {product.brand ? (
            <p className="mt-0.5 truncate text-sm text-[color:var(--muted)]">
              {product.brand}
            </p>
          ) : null}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200/90">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-emerald-500/85 transition-[width]"
              style={{ width: `${ratio}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            <span className="font-medium text-[color:var(--foreground)]">
              {product.quantity}
            </span>
            <span className="mx-1">/</span>
            <span>{product.idealStock}</span>
            {low ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
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
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl bg-[color:var(--input-bg)] text-[color:var(--foreground)] transition hover:bg-stone-200/80 active:scale-95 disabled:opacity-50"
          aria-label="Retirar uma quantidade"
        >
          <Minus className="h-6 w-6" />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => adjustQuantity({ id: product.id, delta: 1 }))}
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_4px_14px_-2px_rgba(47,125,78,0.4)] transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          aria-label="Adicionar uma quantidade"
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="ml-auto inline-flex min-h-[3rem] items-center gap-2 rounded-2xl border border-[color:var(--border-strong)] px-4 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
        >
          <Pencil className="h-5 w-5" />
          Editar
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
          className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl text-rose-600 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50"
          aria-label="Remover produto"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {editing ? (
        <form
          key={product.id}
          className="mt-4 flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-4"
          action={(fd) => {
            run(async () => {
              try {
                await updateProduct({
                  id: product.id,
                  name: String(fd.get("name") ?? "").trim(),
                  brand: String(fd.get("brand") ?? "").trim() || undefined,
                  barcode: String(fd.get("barcode") ?? "").trim() || undefined,
                  category: String(fd.get("category") ?? "").trim() || undefined,
                  imageUrl: imageUrl || undefined,
                  quantity: editQty,
                  idealStock: editIdeal,
                });
                setEditing(false);
              } catch (e) {
                const msg =
                  e instanceof Error ? e.message : "Não foi possível guardar.";
                alert(msg);
              }
            });
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)]">
            Dados do produto
          </p>

          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Nome
            <input
              name="name"
              required
              defaultValue={product.name}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-3 py-3 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Marca
            <input
              name="brand"
              defaultValue={product.brand ?? ""}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-3 py-3 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Código de barras
            <input
              name="barcode"
              defaultValue={product.barcode ?? ""}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Opcional"
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-3 py-3 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
            Categoria
            <input
              name="category"
              defaultValue={product.category ?? ""}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-3 py-3 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
            />
          </label>

          <ProductImageInput
            value={imageUrl}
            onChange={setImageUrl}
            disabled={pending}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[color:var(--muted)]">
                Stock atual
              </span>
              <QuantityStepper
                value={editQty}
                onChange={setEditQty}
                min={0}
                disabled={pending}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[color:var(--muted)]">
                Stock ideal
              </span>
              <QuantityStepper
                value={editIdeal}
                onChange={setEditIdeal}
                min={0}
                disabled={pending}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="min-h-[3rem] flex-1 rounded-2xl bg-[color:var(--accent)] px-4 font-bold text-[color:var(--accent-foreground)] shadow-[0_4px_14px_-2px_rgba(47,125,78,0.35)] transition hover:brightness-105 disabled:opacity-50"
            >
              Guardar alterações
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
              className="min-h-[3rem] rounded-2xl border border-[color:var(--border-strong)] px-4 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-elevated)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
