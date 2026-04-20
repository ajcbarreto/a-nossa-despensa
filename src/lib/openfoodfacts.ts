const OFF_BASE = "https://world.openfoodfacts.org/api/v2/product";

export type OffProductPreview = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  category: string | null;
};

type OffV2Response = {
  status?: number;
  product?: {
    product_name?: string;
    product_name_pt?: string;
    brands?: string;
    image_front_url?: string;
    image_front_small_url?: string;
    categories?: string;
    categories_tags?: string[];
  };
};

function pickName(p: OffV2Response["product"]): string {
  if (!p) return "Produto sem nome";
  const n =
    p.product_name_pt?.trim() ||
    p.product_name?.trim() ||
    "";
  return n || "Produto sem nome";
}

function pickCategory(p: OffV2Response["product"]): string | null {
  const tags = p?.categories_tags;
  if (tags?.length) {
    const first = tags[0];
    if (first?.startsWith("en:")) return first.slice(3).replace(/-/g, " ");
    return first.replace(/-/g, " ");
  }
  const raw = p?.categories?.split(",")?.[0]?.trim();
  return raw || null;
}

/** Consulta Open Food Facts pelo código de barras (EAN/UPC). */
export async function fetchProductByBarcode(
  barcode: string,
): Promise<{ ok: true; data: OffProductPreview } | { ok: false; reason: string }> {
  const clean = barcode.replace(/\s/g, "");
  if (!/^\d{8,14}$/.test(clean)) {
    return { ok: false, reason: "Código inválido. Usa 8–14 dígitos." };
  }

  const res = await fetch(`${OFF_BASE}/${clean}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return { ok: false, reason: "Não foi possível contactar o Open Food Facts." };
  }

  const json = (await res.json()) as OffV2Response;
  if (json.status !== 1 || !json.product) {
    return {
      ok: false,
      reason: "Produto não encontrado na base. Podes adicionar manualmente.",
    };
  }

  const p = json.product;
  const imageUrl =
    p.image_front_small_url?.trim() || p.image_front_url?.trim() || null;

  return {
    ok: true,
    data: {
      barcode: clean,
      name: pickName(p),
      brand: p.brands?.split(",")?.[0]?.trim() || null,
      imageUrl,
      category: pickCategory(p),
    },
  };
}
