"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraOff, Loader2 } from "lucide-react";

type Props = {
  onScan: (text: string) => void;
};

export function BarcodeScanner({ onScan }: Props) {
  /** ID único por montagem — evita conflito com Strict Mode (duplo mount) e reutilização do mesmo DOM. */
  const regionIdRef = useRef<string | null>(null);
  if (regionIdRef.current === null) {
    regionIdRef.current = `barcode-reader-${Math.random().toString(36).slice(2, 12)}`;
  }
  const regionId = regionIdRef.current;

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string | null>(null);
  const cb = useRef(onScan);

  useEffect(() => {
    cb.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    async function start() {
      try {
        scanner = new Html5Qrcode(regionId, false);
        if (cancelled) {
          try {
            scanner.clear();
          } catch {
            /* */
          }
          return;
        }
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: { width: 300, height: 160 },
            aspectRatio: 1.777,
          },
          (decoded) => {
            const t = decoded?.trim();
            if (!t) return;
            if (/^\d{8,14}$/.test(t)) {
              try {
                void Promise.resolve(cb.current(t)).catch(() => {});
              } catch {
                /* callback síncrono */
              }
            }
          },
          () => {},
        );
        if (cancelled) {
          try {
            await scanner.stop();
          } catch {
            /* */
          }
          try {
            scanner.clear();
          } catch {
            /* */
          }
          return;
        }
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          "Não foi possível iniciar a câmara. Verifica permissões ou usa o campo abaixo.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      const s = scanner;
      if (s) {
        void (async () => {
          try {
            await s.stop();
          } catch {
            /* */
          }
          try {
            s.clear();
          } catch {
            /* */
          }
        })();
      }
    };
  }, [regionId]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border-strong)] bg-stone-200">
        <div id={regionId} className="min-h-[220px] w-full" />
        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/45 text-sm text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            A iniciar câmara…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/55 px-6 text-center text-sm text-white">
            <CameraOff className="h-10 w-10 text-rose-200" />
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
