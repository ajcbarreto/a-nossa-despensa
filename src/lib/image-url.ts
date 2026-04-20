/** Limite aproximado para data URLs guardados em SQLite (~2 MB). */
export const MAX_IMAGE_DATA_URL_LENGTH = 2_200_000;

/**
 * Valida e normaliza URL http(s) ou data URL de imagem para guardar em `Product.imageUrl`.
 */
export function normalizeStoredImageUrl(raw?: string | null): string | null {
  const s = raw?.trim();
  if (!s) return null;

  if (s.startsWith("data:image/")) {
    if (s.length > MAX_IMAGE_DATA_URL_LENGTH) {
      throw new Error("Imagem demasiado grande. Tira outra foto ou usa um URL.");
    }
    if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(s)) {
      throw new Error("Formato de imagem não suportado (usa JPEG, PNG ou WebP).");
    }
    return s;
  }

  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("URL da imagem inválida.");
    }
    return u.href;
  } catch {
    throw new Error("URL da imagem inválida.");
  }
}
