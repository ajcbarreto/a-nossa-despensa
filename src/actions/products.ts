"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeStoredImageUrl } from "@/lib/image-url";

const paths = ["/stock", "/compras", "/scan"] as const;

function refresh() {
  for (const p of paths) revalidatePath(p);
}

const addSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
  quantity: z.coerce.number().int().min(0),
  idealStock: z.coerce.number().int().min(0),
  category: z.string().optional(),
});

export async function addProduct(input: z.infer<typeof addSchema>) {
  const data = addSchema.parse(input);
  const barcode =
    data.barcode?.replace(/\s/g, "") || undefined;
  if (barcode && !/^\d{8,14}$/.test(barcode)) {
    throw new Error("Código de barras inválido.");
  }

  const imageUrl = normalizeStoredImageUrl(data.imageUrl);

  try {
    await prisma.product.create({
      data: {
        barcode: barcode || null,
        name: data.name.trim(),
        brand: data.brand?.trim() || null,
        imageUrl,
        quantity: data.quantity,
        idealStock: data.idealStock,
        unit: "un",
        category: data.category?.trim() || null,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("Já existe um produto com este código de barras.");
    }
    throw e;
  }
  refresh();
  redirect("/scan");
}

const adjustSchema = z.object({
  id: z.string().min(1),
  delta: z.number().int(),
});

export async function adjustQuantity(input: z.infer<typeof adjustSchema>) {
  const { id, delta } = adjustSchema.parse(input);
  await prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id } });
    if (!p) throw new Error("Produto não encontrado.");
    const next = Math.max(0, p.quantity + delta);
    await tx.product.update({
      where: { id },
      data: { quantity: next },
    });
  });
  refresh();
}

/** Usado no scanner: se o código existir na despensa, retira 1 ao stock. */
export type RemoveOneByBarcodeResult =
  | {
      ok: true;
      name: string;
      newQuantity: number;
      wasAlreadyZero: boolean;
    }
  | { ok: false; error: "invalid_barcode" | "not_in_pantry" };

export async function removeOneFromStockByBarcode(
  rawBarcode: string,
): Promise<RemoveOneByBarcodeResult> {
  const clean = rawBarcode.replace(/\s/g, "");
  if (!/^\d{8,14}$/.test(clean)) {
    return { ok: false, error: "invalid_barcode" };
  }

  const p = await prisma.product.findUnique({ where: { barcode: clean } });
  if (!p) {
    return { ok: false, error: "not_in_pantry" };
  }

  if (p.quantity <= 0) {
    return {
      ok: true,
      name: p.name,
      newQuantity: 0,
      wasAlreadyZero: true,
    };
  }

  const next = p.quantity - 1;
  await prisma.product.update({
    where: { id: p.id },
    data: { quantity: next },
  });
  refresh();
  return {
    ok: true,
    name: p.name,
    newQuantity: next,
    wasAlreadyZero: false,
  };
}

/** Produto já na despensa: +1 ao stock (entrada rápida pelo scanner). */
export type AddOneByBarcodeResult =
  | { ok: true; name: string; newQuantity: number }
  | { ok: false; error: "invalid_barcode" | "not_in_pantry" };

export async function addOneToStockByBarcode(
  rawBarcode: string,
): Promise<AddOneByBarcodeResult> {
  const clean = rawBarcode.replace(/\s/g, "");
  if (!/^\d{8,14}$/.test(clean)) {
    return { ok: false, error: "invalid_barcode" };
  }

  const p = await prisma.product.findUnique({ where: { barcode: clean } });
  if (!p) {
    return { ok: false, error: "not_in_pantry" };
  }

  const next = p.quantity + 1;
  await prisma.product.update({
    where: { id: p.id },
    data: { quantity: next },
  });
  refresh();
  return { ok: true, name: p.name, newQuantity: next };
}

const updateIdealSchema = z.object({
  id: z.string().min(1),
  idealStock: z.coerce.number().int().min(0),
});

export async function updateIdealStock(input: z.infer<typeof updateIdealSchema>) {
  const data = updateIdealSchema.parse(input);
  await prisma.product.update({
    where: { id: data.id },
    data: { idealStock: data.idealStock },
  });
  refresh();
}

const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Nome obrigatório"),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  quantity: z.coerce.number().int().min(0),
  idealStock: z.coerce.number().int().min(0),
  category: z.string().optional(),
});

export async function updateProduct(input: z.infer<typeof updateProductSchema>) {
  const data = updateProductSchema.parse(input);
  const barcodeTrim = data.barcode?.trim() ?? "";
  let nextBarcode: string | null;
  if (barcodeTrim === "") {
    nextBarcode = null;
  } else {
    const c = barcodeTrim.replace(/\s/g, "");
    if (!/^\d{8,14}$/.test(c)) {
      throw new Error("Código de barras inválido.");
    }
    nextBarcode = c;
  }

  const imageUrl = normalizeStoredImageUrl(data.imageUrl);

  const existing = await prisma.product.findUnique({ where: { id: data.id } });
  if (!existing) throw new Error("Produto não encontrado.");

  try {
    await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        brand: data.brand?.trim() || null,
        barcode: nextBarcode,
        imageUrl,
        quantity: data.quantity,
        idealStock: data.idealStock,
        category: data.category?.trim() || null,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("Já existe um produto com este código de barras.");
    }
    throw e;
  }
  refresh();
}

const purchaseSchema = z.object({
  id: z.string().min(1),
  amount: z.coerce.number().int().min(1),
});

/** Após compra: aumenta stock (ex.: na lista de compras). */
export async function registerPurchase(input: z.infer<typeof purchaseSchema>) {
  const { id, amount } = purchaseSchema.parse(input);
  await prisma.$transaction(async (tx) => {
    const p = await tx.product.findUnique({ where: { id } });
    if (!p) throw new Error("Produto não encontrado.");
    await tx.product.update({
      where: { id },
      data: { quantity: p.quantity + amount },
    });
  });
  refresh();
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteProduct(input: z.infer<typeof deleteSchema>) {
  const { id } = deleteSchema.parse(input);
  await prisma.product.delete({ where: { id } });
  refresh();
}
