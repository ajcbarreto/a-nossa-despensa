"use client";

import { useId, useRef, useState } from "react";
import { Camera, ImageIcon, X } from "lucide-react";

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.82;

async function fileToResizedJpegDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;
  const scale = w > MAX_WIDTH ? MAX_WIDTH / w : 1;
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return dataUrl;
}

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  urlPlaceholder?: string;
};

/**
 * URL manual ou fotografia (câmara / galeria), com pré-visualização.
 */
export function ProductImageInput({
  value,
  onChange,
  disabled = false,
  urlPlaceholder = "https://… ou tira uma foto",
}: Props) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <label className="flex min-h-[3rem] flex-1 min-w-[8rem] flex-col gap-1 text-xs font-medium text-[color:var(--muted)]">
          Imagem (URL)
          <input
            type="text"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => {
              setError(null);
              onChange(e.target.value.trim());
            }}
            disabled={disabled}
            placeholder={urlPlaceholder}
            autoComplete="off"
            className="min-h-[3rem] rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus:ring-2"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-transparent">.</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="inline-flex min-h-[3rem] min-w-[3rem] shrink-0 items-center justify-center gap-2 rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--input-bg)] px-4 font-semibold text-[color:var(--foreground)] transition hover:bg-stone-200/80 disabled:opacity-50"
            aria-label="Tirar ou escolher fotografia"
          >
            <Camera className="h-6 w-6" aria-hidden />
            <span className="hidden sm:inline">Foto</span>
          </button>
          <input
            ref={fileRef}
            id={`${id}-file`}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            disabled={disabled}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file || !file.type.startsWith("image/")) {
                setError("Escolhe um ficheiro de imagem.");
                return;
              }
              setError(null);
              try {
                const dataUrl = await fileToResizedJpegDataUrl(file);
                onChange(dataUrl);
              } catch {
                setError("Não foi possível ler a fotografia.");
              }
            }}
          />
        </div>
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--input-bg)]">
          <div className="flex items-start gap-3 p-2">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex items-center gap-1 text-xs font-medium text-[color:var(--muted)]">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {value.startsWith("data:") ? "Fotografia anexada" : "Pré-visualização"}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setError(null);
                  onChange("");
                }}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rose-600 hover:underline"
              >
                <X className="h-4 w-4" aria-hidden />
                Remover imagem
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
