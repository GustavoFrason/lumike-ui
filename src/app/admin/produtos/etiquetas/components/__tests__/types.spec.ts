import {
  DEFAULT_LABEL_CONFIG,
  getLabelGridStyle,
  getLabelGridColumn,
  getColumnLeftMm,
  getPrintPageSizeMm,
  resizeColumnGaps,
} from '../types';

describe('getLabelGridStyle', () => {
  it('intercala tracks de conteúdo e de vão (cada vão pode ter um tamanho diferente)', () => {
    const style = getLabelGridStyle(DEFAULT_LABEL_CONFIG); // Joia: 27mm, columnGaps [3, 3]

    expect(style.display).toBe('grid');
    expect(style.gridTemplateColumns).toBe('27mm 3mm 27mm 3mm 27mm');
    expect(style.rowGap).toBe('0mm');
    expect(style.paddingLeft).toBe('2mm');
    // Não sobra mais um `columnGap` de CSS Grid — os vãos viram tracks.
    expect(style.columnGap).toBeUndefined();
  });

  it('cada vão pode ter um valor diferente (pedido real: 1mm entre 1→2, 3mm entre 2→3)', () => {
    const style = getLabelGridStyle({ ...DEFAULT_LABEL_CONFIG, columnGaps: [1, 3] });
    expect(style.gridTemplateColumns).toBe('27mm 1mm 27mm 3mm 27mm');
  });

  it('com 1 coluna não sobra nenhuma track de vão', () => {
    const style = getLabelGridStyle({ ...DEFAULT_LABEL_CONFIG, columnsPerRow: 1, columnGaps: [] });
    expect(style.gridTemplateColumns).toBe('27mm');
  });

  it('acompanha rowGap quando ele muda (espaço até a fileira de baixo)', () => {
    const style = getLabelGridStyle({ ...DEFAULT_LABEL_CONFIG, rowGap: 5 });
    expect(style.rowGap).toBe('5mm');
  });
});

describe('getLabelGridColumn', () => {
  it('mapeia coluna 0-indexada pra track de conteúdo (1-indexada, pulando as tracks de vão)', () => {
    expect(getLabelGridColumn(0)).toBe(1);
    expect(getLabelGridColumn(1)).toBe(3);
    expect(getLabelGridColumn(2)).toBe(5);
  });
});

describe('getColumnLeftMm', () => {
  it('coluna 0 começa só depois da margem da borda', () => {
    expect(getColumnLeftMm(DEFAULT_LABEL_CONFIG, 0)).toBe(2); // edgeMargin
  });

  it('soma largura + vão real de cada coluna anterior (vãos diferentes contam certo)', () => {
    const config = { ...DEFAULT_LABEL_CONFIG, columnGaps: [1, 3] };
    // coluna 1: edgeMargin(2) + width(27) + gap[0](1) = 30
    expect(getColumnLeftMm(config, 1)).toBe(30);
    // coluna 2: 30 + width(27) + gap[1](3) = 60
    expect(getColumnLeftMm(config, 2)).toBe(60);
  });
});

describe('resizeColumnGaps', () => {
  it('corta vãos extras quando columnsPerRow diminui', () => {
    expect(resizeColumnGaps([1, 3], 2)).toEqual([1]);
  });

  it('repete o último vão configurado quando columnsPerRow aumenta', () => {
    expect(resizeColumnGaps([1, 3], 4)).toEqual([1, 3, 3]);
  });

  it('usa 3mm de fallback quando não há nenhum vão anterior', () => {
    expect(resizeColumnGaps([], 3)).toEqual([3, 3]);
  });
});

describe('getPrintPageSizeMm', () => {
  it('calcula a largura da bobina inteira (margem + todas as colunas + a soma dos vãos reais)', () => {
    // Joia: edgeMargin 2 + 3 colunas de 27mm + vãos [3, 3] = 2 + 81 + 6 = 89
    const size = getPrintPageSizeMm(DEFAULT_LABEL_CONFIG);
    expect(size).toEqual({ width: 89, height: 15 });
  });

  it('soma vãos diferentes corretamente (1mm entre 1→2, 3mm entre 2→3)', () => {
    const size = getPrintPageSizeMm({ ...DEFAULT_LABEL_CONFIG, columnGaps: [1, 3] });
    // 2 + 81 + (1 + 3) = 87
    expect(size).toEqual({ width: 87, height: 15 });
  });

  it('com 1 coluna, a largura da página é só a etiqueta + a margem', () => {
    const size = getPrintPageSizeMm({ ...DEFAULT_LABEL_CONFIG, columnsPerRow: 1, columnGaps: [] });
    expect(size).toEqual({ width: 2 + 27, height: 15 }); // sem vão, já que só há uma coluna
  });
});
