import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PantryStockView } from "@/components/PantryStockView";
import { PantryHomeActions } from "@/components/PantryHomeActions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-4 pt-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
          A Nossa Despensa
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
          O teu stock
        </h1>
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          Pesquisa, filtra por categoria ou marca e gere quantidades. Com código
          de barras, os dados vêm do{" "}
          <span className="font-medium text-[color:var(--foreground)]">
            Open Food Facts
          </span>{" "}
          quando o produto existe na base.
        </p>
      </header>

      <PantryHomeActions />

      <section className="space-y-4">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-6 py-14 text-center shadow-sm shadow-stone-400/10">
            <p className="text-lg font-semibold text-[color:var(--foreground)]">
              Ainda não há produtos
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Usa «Ler código de barras» ou «Fotografia» para começar, ou
              «Novo produto» para adicionar à mão.
            </p>
            <Link
              href="/scan?novo=1#novo-produto-form"
              className="mt-6 inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-[color:var(--accent)] px-6 font-bold text-[color:var(--accent-foreground)]"
            >
              Adicionar produto
            </Link>
          </div>
        ) : (
          <PantryStockView products={products} />
        )}
      </section>
    </div>
  );
}
