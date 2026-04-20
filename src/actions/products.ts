"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
  unit: z.string().min(1).default("un"),
  category: z.string().optional(),
});

function normalizeImageUrl(raw?: string | null): string | null {
  const s = raw?.trim();
  if (!s) return null;
  try {
    return new URL(s).href;
  } catch {
    throw new Error("URL da imagem inválida.");
  }
}

export async function addProduct(input: z.infer<typeof addSchema>) {
  const data = addSchema.parse(input);
  const barcode =
    data.barcode?.replace(/\s/g, "") || undefined;
  if (barcode && !/^\d{8,14}$/.test(barcode)) {
    throw new Error("Código de barras inválido.");
  }

  const imageUrl = normalizeImageUrl(data.imageUrl);

  try {
    await prisma.product.create({
      data: {
        barcode: barcode || null,
        name: data.name.trim(),
        brand: data.brand?.trim() || null,
        imageUrl,
        quantity: data.quantity,
        idealStock: data.idealStock,
        unit: data.unit,
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
  redirect("/stock");
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

const updateIdealSchema = z.object({
  id: z.string().min(1),
  idealStock: z.coerce.number().int().min(0),
  unit: z.string().min(1),
});

export async function updateIdealAndUnit(
  input: z.infer<typeof updateIdealSchema>,
) {
  const data = updateIdealSchema.parse(input);
  await prisma.product.update({
    where: { id: data.id },
    data: { idealStock: data.idealStock, unit: data.unit },
  });
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
