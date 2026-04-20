import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-4 pt-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
          Despensa
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
            Controlo de stock
          </h1>
          <Link
            href="/scan"
            className="inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_4px_16px_-2px_rgba(47,125,78,0.4)] transition hover:brightness-105 active:scale-[0.98]"
            aria-label="Adicionar com scanner"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </Link>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          Toque grande para entrada e saída rápida. O stock ideal alimenta a
          lista de compras.
        </p>
      </header>

      <section className="space-y-4">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-6 py-14 text-center shadow-sm shadow-stone-400/10">
            <p className="text-lg font-semibold text-[color:var(--foreground)]">
              Ainda não há produtos
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Usa o separador Scanner para ler um código de barras ou adiciona
              manualmente.
            </p>
            <Link
              href="/scan"
              className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] px-6 font-bold text-[color:var(--accent-foreground)]"
            >
              Começar pelo scanner
            </Link>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </section>
    </div>
  );
}
