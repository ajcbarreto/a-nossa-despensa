"use client";

import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
};

/**
 * Controlo por botões +/− — pensado para tablet (alvos de toque largos).
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: Props) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <div
      className={clsx(
        "inline-flex max-w-full items-stretch rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--input-bg)] p-1 shadow-inner",
        className,
      )}
      role="group"
      aria-label="Quantidade"
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="inline-flex min-h-[3rem] min-w-[3rem] shrink-0 items-center justify-center rounded-xl text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-elevated)] active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      </button>
      <output
        className="flex min-w-[3.5rem] flex-1 items-center justify-center px-2 text-center text-xl font-bold tabular-nums text-[color:var(--foreground)]"
        aria-live="polite"
      >
        {value}
      </output>
      <button
        type="button"
        disabled={disabled || atMax}
        onClick={() =>
          onChange(
            max !== undefined ? Math.min(max, value + 1) : value + 1,
          )
        }
        className="inline-flex min-h-[3rem] min-w-[3rem] shrink-0 items-center justify-center rounded-xl text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-elevated)] active:scale-95 disabled:pointer-events-none disabled:opacity-35"
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
