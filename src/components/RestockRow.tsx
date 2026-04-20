"use client";

import { useState, useTransition } from "react";
import { ShoppingBag } from "lucide-react";
import { ProductThumb } from "@/components/ProductThumb";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { Product } from "@prisma/client";
import { registerPurchase } from "@/actions/products";
import { unitsToIdeal } from "@/lib/shopping";

type Props = { product: Product };

export function RestockRow({ product }: Props) {
  const [pending, startTransition] = useTransition();
  const need = unitsToIdeal(product.quantity, product.idealStock);
  const [qty, setQty] = useState(Math.max(1, need));

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 shadow-sm shadow-stone-400/10 sm:flex-row sm:items-center">
      <ProductThumb
        imageUrl={product.imageUrl}
        className="h-16 w-16"
        icon={ShoppingBag}
        iconClassName="h-8 w-8"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[color:var(--foreground)]">
          {product.name}
        </p>
        <p className="text-sm text-[color:var(--muted)]">
          Tens {product.quantity} · Ideal {product.idealStock}
        </p>
        <p className="mt-1 text-sm font-medium text-[color:var(--accent)]">
          Comprar {need} para repor
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <span className="text-xs font-medium text-[color:var(--muted)] sm:text-right">
          Quantidade comprada
        </span>
        <QuantityStepper
          value={qty}
          onChange={setQty}
          min={1}
          disabled={pending}
          className="w-full sm:w-auto"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await registerPurchase({ id: product.id, amount: qty });
            })
          }
          className="min-h-[3rem] rounded-2xl bg-[color:var(--accent)] px-4 text-sm font-bold text-[color:var(--accent-foreground)] shadow-[0_4px_14px_-2px_rgba(47,125,78,0.35)] active:scale-[0.98] disabled:opacity-50"
        >
          Registrei
        </button>
      </div>
    </div>
  );
}
