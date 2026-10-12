/**
 * Só para EXIBIR valores por peça no preview da importação. A conversão de
 * verdade (estoque em peças, custo/preço por peça) é feita pela API no
 * confirm — ver lumike-api/src/purchase-import/kit-conversion.util.ts.
 */

export const MAX_PIECES_PER_KIT = 500;

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Garante um nº de peças válido (inteiro entre 1 e 500). */
export function clampPieces(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_PIECES_PER_KIT, Math.max(1, Math.floor(value)));
}

/** Valor por unidade comprada (kit) → valor por peça, em centavos. */
export function perPiece(kitValue: number, piecesPerKit: number): number {
  return round2(kitValue / clampPieces(piecesPerKit));
}

/** Valor por peça → valor por unidade comprada (kit). */
export function perKit(pieceValue: number, piecesPerKit: number): number {
  return round2(pieceValue * clampPieces(piecesPerKit));
}
