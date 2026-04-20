"use server";

import { fetchProductByBarcode } from "@/lib/openfoodfacts";

export async function lookupBarcode(barcode: string) {
  return fetchProductByBarcode(barcode);
}
