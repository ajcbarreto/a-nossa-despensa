"use client";

import { useState, type ComponentType } from "react";
import clsx from "clsx";

type Props = {
  imageUrl: string | null | undefined;
  /** Classes do contentor (ex.: h-24 w-24) */
  className?: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
};

/**
 * Imagem externa com fallback — evita erros do `next/image` com URLs/domínios imprevistos.
 */
export function ProductThumb({
  imageUrl,
  className,
  icon: Icon,
  iconClassName = "h-10 w-10",
}: Props) {
  const [broken, setBroken] = useState(false);
  const trimmed = imageUrl?.trim() ?? "";
  const show = Boolean(trimmed) && !broken;

  return (
    <div
      className={clsx(
        "relative shrink-0 overflow-hidden rounded-2xl bg-[color:var(--input-bg)]",
        className,
      )}
    >
      {show ? (
        // URLs externas variáveis — evita falhas de runtime do next/image com domínios não listados
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={trimmed}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[color:var(--muted)]">
          <Icon className={iconClassName} />
        </div>
      )}
    </div>
  );
}
