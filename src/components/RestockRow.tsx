"use client";

import { useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";
import { ProductThumb } from "@/components/ProductThumb";
import type { Product } from "@prisma/client";
import { registerPurchase } from "@/actions/products";
import { unitsToIdeal } from "@/lib/shopping";

type Props = { product: Product };

export function RestockRow({ product }: Props) {
  const [pending, startTransition] = useTransition();
  const need = unitsToIdeal(product.quantity, product.idealStock);
  const [qty, setQty] = useState(String(Math.max(1, need)));

  return (
    <div className="flex gap-3 rounded-3xl border border-white/10 bg-[color:var(--surface-elevated)] p-3">
      <ProductThumb
        imageUrl={product.imageUrl}
        className="h-16 w-16"
        icon={ShoppingBag}
        iconClassName="h-8 w-8"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{product.name}</p>
        <p className="text-sm text-[color:var(--muted)]">
          Tens {product.quantity} · Ideal {product.idealStock} {product.unit}
        </p>
        <p className="mt-1 text-sm font-medium text-[color:var(--accent)]">
          Comprar {need} para repor
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-2">
        <label className="sr-only" htmlFor={`qty-${product.id}`}>
          Quantidade comprada
        </label>
        <input
          id={`qty-${product.id}`}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-20 rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center text-base text-white outline-none ring-[color:var(--accent)] focus:ring-2"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const n = Math.max(1, Number(qty) || 1);
              await registerPurchase({ id: product.id, amount: n });
            })
          }
          className="min-h-[2.75rem] rounded-2xl bg-[color:var(--accent)] px-4 text-sm font-bold text-[color:var(--accent-foreground)] shadow-lg shadow-emerald-900/30 active:scale-[0.98] disabled:opacity-50"
        >
          Registrei
        </button>
      </div>
    </div>
  );
}
