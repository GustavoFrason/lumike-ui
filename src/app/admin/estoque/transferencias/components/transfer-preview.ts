import type {
  StockLocationId,
  TransferBatchItemPreview,
} from '@/lib/services/transfer-batches.service';

export const CENTRAL_LABEL = 'Estoque Lumilee (Central)';

export interface TransferTotals {
  /** Peças diferentes. */
  pieces: number;
  /** Unidades somadas. */
  units: number;
  /** Valor pelo preço atual. */
  value: number;
}

export function summarizeItems(items: { quantity: number; price: number }[]): TransferTotals {
  return items.reduce(
    (acc, item) => ({
      pieces: acc.pieces + 1,
      units: acc.units + item.quantity,
      value: acc.value + item.quantity * item.price,
    }),
    { pieces: 0, units: 0, value: 0 },
  );
}

/** Ajusta a quantidade de uma peça, sempre entre 1 e o disponível na origem. */
export function setItemQuantity(
  items: TransferBatchItemPreview[],
  productId: number,
  quantity: number,
): TransferBatchItemPreview[] {
  return items.map((item) => {
    if (item.product_id !== productId) return item;
    const whole = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
    return { ...item, quantity: Math.min(Math.max(whole, 1), item.available) };
  });
}

export function removeItem(
  items: TransferBatchItemPreview[],
  productId: number,
): TransferBatchItemPreview[] {
  return items.filter((item) => item.product_id !== productId);
}

/** Nome do local para exibir (null = Central). */
export function locationLabel(
  id: StockLocationId,
  sellers: { id: number; name: string }[],
): string {
  if (id === null) return CENTRAL_LABEL;
  return sellers.find((s) => s.id === id)?.name ?? `Revendedora #${id}`;
}

/** Nome vindo do histórico/romaneio (nome null = Central). */
export function batchLocationLabel(userId: number | null, name: string | null): string {
  if (userId === null) return CENTRAL_LABEL;
  return name ?? `Revendedora #${userId}`;
}

/**
 * Lê o local da URL (`?origem=12&destino=central`): 'central' → null,
 * id → número, qualquer outra coisa → undefined (ignora).
 */
export function parseLocationParam(value: string | null): StockLocationId | undefined {
  if (value === 'central') return null;
  if (value && /^\d+$/.test(value)) return Number(value);
  return undefined;
}

/** "Linha 3" / "Linhas 3, 8". */
export function formatRowNumbers(rows: number[]): string {
  if (rows.length === 0) return '';
  return `${rows.length === 1 ? 'Linha' : 'Linhas'} ${rows.join(', ')}`;
}
