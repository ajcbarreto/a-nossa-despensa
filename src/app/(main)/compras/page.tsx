import { prisma } from "@/lib/prisma";
import { isBelowIdeal } from "@/lib/shopping";
import { RestockRow } from "@/components/RestockRow";
import { ManualShoppingSection } from "@/components/ManualShoppingSection";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const [products, manualOpen, manualDone] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.manualShoppingItem.findMany({
      where: { isDone: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.manualShoppingItem.findMany({
      where: { isDone: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const restock = products.filter((p) => isBelowIdeal(p.quantity, p.idealStock));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-4 pb-4 pt-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
          Supermercado
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
          Lista de compras
        </h1>
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          Itens abaixo do stock ideal aparecem aqui com a quantidade exata a
          repor. No fim das compras, regista o que entrar.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Repor stock ideal
        </h2>
        {restock.length === 0 ? (
          <p className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5 py-8 text-center text-sm text-[color:var(--muted)] shadow-sm shadow-stone-400/10">
            Tudo acima ou igual ao stock ideal. Bom trabalho.
          </p>
        ) : (
          <ul className="space-y-3">
            {restock.map((p) => (
              <li key={p.id}>
                <RestockRow product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ManualShoppingSection items={manualOpen} />

      {manualDone.length > 0 ? (
        <section className="space-y-2 opacity-70">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Concluídos recentemente
          </h2>
          <ul className="space-y-1 text-sm text-[color:var(--muted)]">
            {manualDone.map((m) => (
              <li key={m.id} className="line-through">
                {m.title} · {m.quantity}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
