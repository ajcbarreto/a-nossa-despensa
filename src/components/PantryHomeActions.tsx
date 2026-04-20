"use client";

import Link from "next/link";
import { ScanLine, PlusCircle } from "lucide-react";
import { BarcodeFromImageButton } from "@/components/BarcodeFromImageButton";

export function PantryHomeActions() {
  return (
    <div className="space-y-3">
      <Link
        href="/scan"
        className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 text-base font-bold text-[color:var(--accent-foreground)] shadow-[0_4px_16px_-2px_rgba(47,125,78,0.4)] transition hover:brightness-105 active:scale-[0.99]"
      >
        <ScanLine className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden />
        Ler código de barras
      </Link>
      <div className="flex gap-2">
        <BarcodeFromImageButton />
        <Link
          href="/scan?novo=1#novo-produto-form"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:bg-[color:var(--panel-muted)] active:scale-[0.99]"
        >
          <PlusCircle className="h-5 w-5 shrink-0" aria-hidden />
          Novo produto
        </Link>
      </div>
      <p className="text-center text-xs text-[color:var(--muted)]">
        «Fotografia» usa a imagem para ler o código (não substitui o Open Food Facts
        na ficha do produto).
      </p>
    </div>
  );
}
