"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { addProduct } from "@/actions/products";

type Props = {
  barcode?: string | null;
  defaultName?: string;
  defaultBrand?: string | null;
  defaultImage?: string | null;
  defaultCategory?: string | null;
};

export function AddProductForm({
  barcode,
  defaultName = "",
  defaultBrand,
  defaultImage,
  defaultCategory,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-3xl border border-white/10 bg-[color:var(--surface-elevated)] p-5"
      action={(fd) =>
        startTransition(async () => {
          const rawUrl = String(fd.get("imageUrl") ?? "").trim();
          await addProduct({
            barcode: String(fd.get("barcode") ?? "") || undefined,
            name: String(fd.get("name") ?? ""),
            brand: String(fd.get("brand") ?? "") || undefined,
            imageUrl: rawUrl || undefined,
            quantity: Number(fd.get("quantity") ?? 0),
            idealStock: Number(fd.get("idealStock") ?? 1),
            unit: String(fd.get("unit") ?? "un"),
            category: String(fd.get("category") ?? "") || undefined,
          });
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
          className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Nome
        <input
          name="name"
          required
          defaultValue={defaultName}
          className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Marca
        <input
          name="brand"
          defaultValue={defaultBrand ?? ""}
          className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Imagem (URL)
        <input
          name="imageUrl"
          defaultValue={defaultImage ?? ""}
          className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
        Categoria
        <input
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
          Stock atual
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={1}
            className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
          Stock ideal
          <input
            name="idealStock"
            type="number"
            min={0}
            defaultValue={3}
            className="min-h-[3rem] rounded-2xl border border-white/10 bg-black/30 px-3 text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
          Unidade
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
        className="flex w-full min-h-[3.25rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] text-base font-bold text-[color:var(--accent-foreground)] shadow-xl shadow-emerald-900/40 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "A guardar…" : "Guardar na despensa"}
      </button>
    </form>
  );
}
