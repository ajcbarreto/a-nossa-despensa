"use client";

import { useCallback, useRef, useState } from "react";
import { lookupBarcode } from "@/actions/lookup";
import {
  addOneToStockByBarcode,
  removeOneFromStockByBarcode,
} from "@/actions/products";
import type { OffProductPreview } from "@/lib/openfoodfacts";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { AddProductForm } from "@/components/AddProductForm";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";

export function ScanExperience() {
  const [hint, setHint] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [preview, setPreview] = useState<OffProductPreview | null>(null);
  const [offLookupFailed, setOffLookupFailed] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<"add" | "remove" | null>(null);
  const last = useRef<{ code: string; at: number } | null>(null);

  const inChoiceOnly =
    scannedCode !== null && preview === null && !offLookupFailed;
  const showForm = !inChoiceOnly;

  function resetScan() {
    setScannedCode(null);
    setPreview(null);
    setOffLookupFailed(false);
    setHint(null);
  }

  const onScan = useCallback((code: string) => {
    const now = Date.now();
    if (
      last.current &&
      last.current.code === code &&
      now - last.current.at < 1500
    ) {
      return;
    }
    last.current = { code, at: now };

    const clean = code.replace(/\s/g, "");
    if (!/^\d{8,14}$/.test(clean)) {
      setHint("Código inválido. Usa 8–14 dígitos.");
      return;
    }

    setScannedCode(clean);
    setPreview(null);
    setOffLookupFailed(false);
    setHint(
      "Código lido. Escolhe se queres adicionar ou retirar uma unidade à despensa.",
    );
  }, []);

  async function handleRetirar() {
    if (!scannedCode) return;
    setLoadingBtn("remove");
    try {
      const removed = await removeOneFromStockByBarcode(scannedCode);
      if (removed.ok) {
        if (removed.wasAlreadyZero) {
          setHint(
            `«${removed.name}» — já tinhas 0 na despensa. (Stock continua 0.)`,
          );
        } else {
          setHint(
            `«${removed.name}» — retirada 1. Stock agora: ${removed.newQuantity}.`,
          );
        }
        resetScan();
        return;
      }
      if (removed.error === "invalid_barcode") {
        setHint("Código inválido.");
        return;
      }
      setHint(
        "Este código ainda não está na despensa. Usa «Adicionar 1» para o registar.",
      );
    } finally {
      setLoadingBtn(null);
    }
  }

  async function handleAdicionar() {
    if (!scannedCode) return;
    setLoadingBtn("add");
    try {
      const added = await addOneToStockByBarcode(scannedCode);
      if (added.ok) {
        setHint(
          `«${added.name}» — entrada +1. Stock agora: ${added.newQuantity}.`,
        );
        resetScan();
        return;
      }
      if (added.error === "invalid_barcode") {
        setHint("Código inválido.");
        return;
      }

      setHint("A consultar Open Food Facts…");
      try {
        const res = await lookupBarcode(scannedCode);
        if (!res.ok) {
          setOffLookupFailed(true);
          setHint(
            `${res.reason} Preenche o formulário abaixo para adicionar à mão.`,
          );
          return;
        }
        setPreview(res.data);
        setHint("Produto novo — confirma os dados e guarda na despensa.");
      } catch (e) {
        setOffLookupFailed(true);
        const msg =
          e instanceof Error ? e.message : "Erro de rede ao consultar o produto.";
        setHint(`${msg} Podes usar o formulário abaixo.`);
      }
    } finally {
      setLoadingBtn(null);
    }
  }

  return (
    <div className="space-y-6">
      <BarcodeScanner onScan={onScan} />

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-muted)] px-4 py-3 text-sm text-[color:var(--muted)]">
        {hint ??
          "Lê o código de barras e depois indica se queres adicionar ou retirar uma unidade."}
      </div>

      {inChoiceOnly ? (
        <div className="space-y-4 rounded-3xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] p-4 shadow-sm">
          <p className="text-center font-mono text-lg font-bold tracking-wide text-[color:var(--foreground)]">
            {scannedCode}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={loadingBtn !== null}
              onClick={() => void handleRetirar()}
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl border-2 border-[color:var(--border-strong)] bg-[color:var(--input-bg)] px-4 text-base font-bold text-[color:var(--foreground)] transition hover:bg-stone-200/80 active:scale-[0.99] disabled:opacity-50"
            >
              {loadingBtn === "remove" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Minus className="h-7 w-7" strokeWidth={2.5} aria-hidden />
              )}
              Retirar 1
            </button>
            <button
              type="button"
              disabled={loadingBtn !== null}
              onClick={() => void handleAdicionar()}
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 text-base font-bold text-[color:var(--accent-foreground)] shadow-[0_4px_16px_-2px_rgba(47,125,78,0.4)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {loadingBtn === "add" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Plus className="h-7 w-7" strokeWidth={2.5} aria-hidden />
              )}
              Adicionar 1
            </button>
          </div>
          <button
            type="button"
            onClick={resetScan}
            disabled={loadingBtn !== null}
            className="flex w-full min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[color:var(--panel-muted)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Ler outro código
          </button>
        </div>
      ) : null}

      {preview ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={resetScan}
            className="text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
          >
            Cancelar e ler outro código
          </button>
          <AddProductForm
            key={preview.barcode}
            barcode={preview.barcode}
            defaultName={preview.name}
            defaultBrand={preview.brand}
            defaultImage={preview.imageUrl}
            defaultCategory={preview.category}
          />
        </div>
      ) : null}

      {showForm && !preview ? (
        <div className="space-y-2">
          {offLookupFailed && scannedCode ? (
            <p className="text-center text-xs font-medium text-[color:var(--muted)]">
              Adicionar com código {scannedCode}
            </p>
          ) : (
            <p className="text-center text-xs font-medium text-[color:var(--muted)]">
              Ou adiciona um produto sem passar pelo código de barras
            </p>
          )}
          <AddProductForm
            key={scannedCode ?? "manual"}
            barcode={scannedCode ?? undefined}
            defaultName=""
            defaultBrand={undefined}
            defaultImage={undefined}
            defaultCategory={undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
