"use client";

import { useEffect, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { addProduct } from "@/actions/products";
import { QuantityStepper } from "@/components/QuantityStepper";
import { ProductImageInput } from "@/components/ProductImageInput";

type Props = {
  barcode?: string | null;
  defaultName?: string;
  defaultBrand?: string | null;
  defaultImage?: string | null;
  defaultCategory?: string | null;
  /** Para âncoras (`#id`) ao abrir «Novo produto» a partir da página inicial. */
  formId?: string;
};

export function AddProductForm({
  barcode,
  defaultName = "",
  defaultBrand,
  defaultImage,
  defaultCategory,
  formId,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [stockQty, setStockQty] = useState(1);
  const [idealQty, setIdealQty] = useState(3);
  const [imageUrl, setImageUrl] = useState(defaultImage ?? "");

  useEffect(() => {
    setImageUrl(defaultImage ?? "");
  }, [defaultImage]);

  return (
    <form
      id={formId}
      className="space-y-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5 shadow-lg shadow-stone-400/12"
      action={(fd) =>
        startTransition(async () => {
          await addProduct({
            barcode: String(fd.get("barcode") ?? "") || undefined,
            name: String(fd.get("name") ?? ""),
            brand: String(fd.get("brand") ?? "") || undefined,
            imageUrl: imageUrl || undefined,
            quantity: Number(fd.get("quantity") ?? 0),
            idealStock: Number(fd.get("idealStock") ?? 1),
            category: String(fd.get("category") ?? "") || undefined,
          });
          setStockQty(1);
          setIdealQty(3);
          setImageUrl("");
        })
      }
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--accent)]">
        <Sparkles className="h-4 w-4" />
        Novo produto na despensa
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Código de barras
        <input
          name="barcode"
          defaultValue={barcode ?? ""}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Opcional"
          className="min-h-[3rem] rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Nome
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="min-h-[3rem] rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Marca
        <input
          name="brand"
          defaultValue={defaultBrand ?? ""}
          className="min-h-[3rem] rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <ProductImageInput
        value={imageUrl}
        onChange={setImageUrl}
        disabled={pending}
      />

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Categoria
        <input
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="min-h-[3rem] rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <input type="hidden" name="quantity" value={stockQty} readOnly />
      <input type="hidden" name="idealStock" value={idealQty} readOnly />

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[color:var(--muted)]">
            Stock atual
          </span>
          <QuantityStepper
            value={stockQty}
            onChange={setStockQty}
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
            value={idealQty}
            onChange={setIdealQty}
            min={0}
            disabled={pending}
            className="w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full min-h-[3.25rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] text-base font-bold text-[color:var(--accent-foreground)] shadow-[0_6px_20px_-4px_rgba(47,125,78,0.45)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "A guardar…" : "Guardar na despensa"}
      </button>
    </form>
  );
}
