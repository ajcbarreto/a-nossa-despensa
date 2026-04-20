"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Product } from "@prisma/client";
import { LayoutList, Search, Tag } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { isBelowIdeal } from "@/lib/shopping";

type GroupMode = "flat" | "category" | "brand";

const NONE = "__none__";

type Props = { products: Product[] };

function normalize(s: string | null | undefined): string {
  return (s ?? "").trim();
}

function matchesSearch(p: Product, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  if (p.name.toLowerCase().includes(t)) return true;
  const brand = normalize(p.brand).toLowerCase();
  if (brand && brand.includes(t)) return true;
  const cat = normalize(p.category).toLowerCase();
  if (cat && cat.includes(t)) return true;
  const code = normalize(p.barcode).toLowerCase();
  if (code && code.includes(t)) return true;
  return false;
}

function categoryKey(p: Product): string {
  return normalize(p.category) || NONE;
}

function brandKey(p: Product): string {
  return normalize(p.brand) || NONE;
}

function labelForCategoryKey(key: string): string {
  return key === NONE ? "Sem categoria" : key;
}

function labelForBrandKey(key: string): string {
  return key === NONE ? "Sem marca" : key;
}

export function PantryStockView({ products }: Props) {
  const [query, setQuery] = useState("");
  const [groupMode, setGroupMode] = useState<GroupMode>("category");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");
  const [brandFilter, setBrandFilter] = useState<"all" | string>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const categoryOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const p of products) keys.add(categoryKey(p));
    return sortKeys([...keys], NONE);
  }, [products]);

  const brandOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const p of products) keys.add(brandKey(p));
    return sortKeys([...keys], NONE);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!matchesSearch(p, query)) return false;
      if (categoryFilter !== "all" && categoryKey(p) !== categoryFilter) {
        return false;
      }
      if (brandFilter !== "all" && brandKey(p) !== brandFilter) {
        return false;
      }
      if (lowStockOnly && !isBelowIdeal(p.quantity, p.idealStock)) {
        return false;
      }
      return true;
    });
  }, [products, query, categoryFilter, brandFilter, lowStockOnly]);

  const sections = useMemo(() => {
    if (groupMode === "flat") {
      const sorted = [...filtered].sort((a, b) =>
        a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
      );
      return [{ title: null as string | null, items: sorted }];
    }

    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key =
        groupMode === "category" ? categoryKey(p) : brandKey(p);
      const list = map.get(key);
      if (list) list.push(p);
      else map.set(key, [p]);
    }

    const keys = sortKeys([...map.keys()], NONE);
    return keys.map((key) => {
      const items = map.get(key) ?? [];
      items.sort((a, b) =>
        a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
      );
      const title =
        groupMode === "category"
          ? labelForCategoryKey(key)
          : labelForBrandKey(key);
      return { title, items };
    });
  }, [filtered, groupMode]);

  const empty = filtered.length === 0;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-[color:var(--bg)]/95 px-4 pb-2 pt-1 backdrop-blur-sm">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar nome, marca, categoria ou código…"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] py-3.5 pl-12 pr-4 text-base text-[color:var(--foreground)] shadow-sm outline-none ring-[color:var(--accent)] placeholder:text-[color:var(--muted)] focus:ring-2"
            aria-label="Pesquisar na despensa"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <span className="w-full text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Agrupar
          </span>
          <div className="flex w-full gap-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] p-1">
            <button
              type="button"
              onClick={() => setGroupMode("flat")}
              className={`flex min-h-[2.75rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold transition ${
                groupMode === "flat"
                  ? "bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] shadow-sm"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <LayoutList className="h-4 w-4 shrink-0" aria-hidden />
              A–Z
            </button>
            <button
              type="button"
              onClick={() => setGroupMode("category")}
              className={`flex min-h-[2.75rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold transition ${
                groupMode === "category"
                  ? "bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] shadow-sm"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <Tag className="h-4 w-4 shrink-0" aria-hidden />
              Categoria
            </button>
            <button
              type="button"
              onClick={() => setGroupMode("brand")}
              className={`flex min-h-[2.75rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold transition ${
                groupMode === "brand"
                  ? "bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] shadow-sm"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <span className="text-xs font-bold leading-none" aria-hidden>
                ®
              </span>
              Marca
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setLowStockOnly((v) => !v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              lowStockOnly
                ? "bg-amber-100 text-amber-950 ring-2 ring-amber-400/60"
                : "border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] hover:bg-[color:var(--panel-muted)]"
            }`}
            aria-pressed={lowStockOnly}
          >
            Só em falta
          </button>
          <p className="text-xs text-[color:var(--muted)]">
            {empty ? "0" : filtered.length} produto
            {filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {categoryOptions.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Categoria
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterChip
                selected={categoryFilter === "all"}
                onClick={() => setCategoryFilter("all")}
              >
                Todas
              </FilterChip>
              {categoryOptions.map((key) => (
                <FilterChip
                  key={key}
                  selected={categoryFilter === key}
                  onClick={() =>
                    setCategoryFilter((c) => (c === key ? "all" : key))
                  }
                >
                  {labelForCategoryKey(key)}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}

        {brandOptions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="pantry-brand-filter"
              className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]"
            >
              Marca
            </label>
            <select
              id="pantry-brand-filter"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="min-h-[3rem] w-full rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 text-base font-medium text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
            >
              <option value="all">Todas as marcas</option>
              {brandOptions.map((key) => (
                <option key={key} value={key}>
                  {labelForBrandKey(key)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {empty ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-6 py-12 text-center shadow-sm shadow-stone-400/10">
          <p className="text-base font-semibold text-[color:var(--foreground)]">
            Nenhum produto com estes filtros
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Limpa a pesquisa ou escolhe «Todas» nas categorias e marcas.
          </p>
          <button
            type="button"
            className="mt-5 min-h-[3rem] rounded-2xl border border-[color:var(--border-strong)] px-5 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--panel-muted)]"
            onClick={() => {
              setQuery("");
              setCategoryFilter("all");
              setBrandFilter("all");
              setLowStockOnly(false);
            }}
          >
            Repor filtros
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={sec.title ?? "flat"} className="space-y-3">
              {sec.title ? (
                <h2 className="border-b border-[color:var(--border)] pb-2 text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                  {sec.title}
                </h2>
              ) : null}
              <ul className="space-y-4">
                {sec.items.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
        selected
          ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_2px_10px_-2px_rgba(47,125,78,0.45)]"
          : "border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] text-[color:var(--foreground)] hover:bg-[color:var(--panel-muted)]"
      }`}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

function sortKeys(keys: string[], noneToken: string): string[] {
  return [...keys].sort((a, b) => {
    const aEmpty = a === noneToken;
    const bEmpty = b === noneToken;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    return a.localeCompare(b, "pt", { sensitivity: "base" });
  });
}
