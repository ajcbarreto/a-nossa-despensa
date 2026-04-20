"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Image, Loader2 } from "lucide-react";

/** Lê código de barras a partir de uma fotografia (galeria ou câmara em muitos telemóveis). */
export function BarcodeFromImageButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const regionId = useId().replace(/:/g, "");
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const q = new Html5Qrcode(regionId, false);
      const text = await q.scanFile(file, false);
      try {
        await q.clear();
      } catch {
        /* */
      }
      const clean = text?.trim().replace(/\s/g, "") ?? "";
      if (!/^\d{8,14}$/.test(clean)) {
        window.alert(
          "Não foi encontrado um código de barras válido (8–14 dígitos) nesta imagem.",
        );
        return;
      }
      router.push(`/scan?code=${encodeURIComponent(clean)}`);
    } catch {
      window.alert(
        "Não foi possível ler o código na imagem. Tenta uma foto mais nítida e com o código visível.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div id={regionId} className="sr-only" aria-hidden />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={onChange}
        aria-hidden
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:bg-[color:var(--panel-muted)] active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Image className="h-5 w-5 shrink-0" aria-hidden />
        )}
        Fotografia
      </button>
    </>
  );
}
