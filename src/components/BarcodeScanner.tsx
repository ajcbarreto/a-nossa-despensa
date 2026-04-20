"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CameraOff, Loader2 } from "lucide-react";

type Props = {
  onScan: (text: string) => void;
};

export function BarcodeScanner({ onScan }: Props) {
  const reactId = useId();
  const regionId = `barcode-reader-${reactId.replace(/:/g, "")}`;
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
        scanner = new Html5Qrcode(regionId, /* verbose */ false);
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
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            "Não foi possível iniciar a câmara. Verifica permissões ou usa o campo abaixo.",
          );
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      const s = scanner;
      scanner = null;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [regionId]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <div id={regionId} className="min-h-[220px] w-full" />
        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-sm text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            A iniciar câmara…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 px-6 text-center text-sm text-white">
            <CameraOff className="h-10 w-10 text-rose-300" />
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
