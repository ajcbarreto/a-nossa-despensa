"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ScanLine, ShoppingCart } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/scan", label: "Scanner", Icon: ScanLine },
  { href: "/stock", label: "Stock", Icon: Package },
  { href: "/compras", label: "Compras", Icon: ShoppingCart },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 shadow-[0_-4px_24px_-8px_rgba(28,25,23,0.06)] backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex min-h-[3.25rem] min-w-[5rem] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold tracking-wide transition active:scale-[0.98]",
                active
                  ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                  : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
              )}
            >
              <Icon
                className={clsx("h-7 w-7", active && "stroke-[2.5]")}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
