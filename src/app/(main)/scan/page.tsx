import { ScanExperience } from "@/components/ScanExperience";

type Props = {
  searchParams: Promise<{ code?: string; novo?: string }>;
};

export default async function ScanPage({ searchParams }: Props) {
  const sp = await searchParams;
  const code = typeof sp.code === "string" ? sp.code : undefined;
  const novo = sp.novo === "1" || sp.novo === "true";
  const prefillManual = Boolean(novo && !code);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-4 pt-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
          Scanner
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
          Scanner
        </h1>
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          Liga a câmara traseira. Se o código já existir na tua despensa,
          retira-se 1 unidade{" "}
          ao stock. Se ainda não existir, os dados vêm do{" "}
          <a
            className="font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
          >
            Open Food Facts
          </a>{" "}
          para adicionares o produto (podes editar antes de guardar).
        </p>
      </header>

      <ScanExperience
        initialBarcode={code}
        prefillManual={prefillManual}
      />
    </div>
  );
}
