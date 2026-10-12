import { clampPieces, perKit, perPiece } from '../kit-conversion';

describe('kit-conversion (exibição no preview)', () => {
  it('perPiece divides the kit value by the pieces, in cents', () => {
    expect(perPiece(240, 12)).toBe(20);
    expect(perPiece(10, 3)).toBe(3.33);
  });

  it('perKit is the inverse used when editing the price per piece', () => {
    expect(perKit(19.9, 12)).toBe(238.8);
    // ida e volta preserva o preço por peça digitado
    expect(perPiece(perKit(9.99, 12), 12)).toBe(9.99);
  });

  it('clampPieces keeps the value between 1 and 500', () => {
    expect(clampPieces(0)).toBe(1);
    expect(clampPieces(-3)).toBe(1);
    expect(clampPieces(Number.NaN)).toBe(1);
    expect(clampPieces(12.7)).toBe(12);
    expect(clampPieces(9999)).toBe(500);
  });
});
