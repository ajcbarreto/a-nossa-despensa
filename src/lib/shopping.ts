/** Quantidade a comprar para atingir o stock ideal. */
export function unitsToIdeal(quantity: number, idealStock: number): number {
  return Math.max(0, idealStock - quantity);
}

export function isBelowIdeal(quantity: number, idealStock: number): boolean {
  return quantity < idealStock;
}
