"use client";

import { useCallback, useRef, useState } from "react";
import { lookupBarcode } from "@/actions/lookup";
import type { OffProductPreview } from "@/lib/openfoodfacts";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { AddProductForm } from "@/components/AddProductForm";

export function ScanExperience() {
  const [hint, setHint] = useState<string | null>(null);
  const [preview, setPreview] = useState<OffProductPreview | null>(null);
  const last = useRef<{ code: string; at: number } | null>(null);

  const onScan = useCallback(async (code: string) => {
    const now = Date.now();
    if (
      last.current &&
      last.current.code === code &&
      now - last.current.at < 1500
    ) {
      return;
    }
    last.current = { code, at: now };

    setHint("A consultar Open Food Facts…");
    setPreview(null);
    try {
      const res = await lookupBarcode(code);
      if (!res.ok) {
        setHint(res.reason);
        return;
      }
      setHint("Encontrado — confirma os dados e guarda.");
      setPreview(res.data);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Erro de rede ao consultar o produto.";
      setHint(msg);
    }
  }, []);

  return (
    <div className="space-y-6">
      <BarcodeScanner onScan={onScan} />

      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-[color:var(--muted)]">
        {hint ?? "Aponta para o código de barras — a leitura é automática."}
      </div>

      {preview ? (
        <AddProductForm
          barcode={preview.barcode}
          defaultName={preview.name}
          defaultBrand={preview.brand}
          defaultImage={preview.imageUrl}
          defaultCategory={preview.category}
        />
      ) : (
        <AddProductForm />
      )}
    </div>
  );
}
