"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

function refresh() {
  revalidatePath("/compras");
}

const addSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  quantity: z.coerce.number().int().min(1),
  unit: z.string().min(1).default("un"),
});

export async function addManualShoppingItem(
  input: z.infer<typeof addSchema>,
) {
  const data = addSchema.parse(input);
  await prisma.manualShoppingItem.create({
    data: {
      title: data.title.trim(),
      quantity: data.quantity,
      unit: data.unit,
    },
  });
  refresh();
}

const toggleSchema = z.object({ id: z.string().min(1) });

export async function toggleManualItemDone(
  input: z.infer<typeof toggleSchema>,
) {
  const { id } = toggleSchema.parse(input);
  const row = await prisma.manualShoppingItem.findUnique({ where: { id } });
  if (!row) throw new Error("Item não encontrado.");
  await prisma.manualShoppingItem.update({
    where: { id },
    data: { isDone: !row.isDone },
  });
  refresh();
}

export async function deleteManualItem(input: z.infer<typeof toggleSchema>) {
  const { id } = toggleSchema.parse(input);
  await prisma.manualShoppingItem.delete({ where: { id } });
  refresh();
}
