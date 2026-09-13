import { DEFAULT_LABEL_CONFIG, getLabelGridStyle, getPrintPageSizeMm } from '../types';

describe('getLabelGridStyle', () => {
  it('usa grid com columnsPerRow colunas fixas — não flex-wrap, que deixava o navegador decidir quantas cabiam', () => {
    const style = getLabelGridStyle(DEFAULT_LABEL_CONFIG); // Joia: 27mm, columnsPerRow 3

    expect(style.display).toBe('grid');
    expect(style.gridTemplateColumns).toBe('repeat(3, 27mm)');
    expect(style.columnGap).toBe('3mm');
    expect(style.paddingLeft).toBe('2mm');
  });

  it('acompanha columnsPerRow quando ele muda (ex: bobina de coluna única)', () => {
    const style = getLabelGridStyle({ ...DEFAULT_LABEL_CONFIG, columnsPerRow: 1 });
    expect(style.gridTemplateColumns).toBe('repeat(1, 27mm)');
  });
});

describe('getPrintPageSizeMm', () => {
  it('calcula a largura da bobina inteira (margem + todas as colunas + espaços), não "auto"', () => {
    // Joia: edgeMargin 2 + 3 colunas de 27mm + 2 espaços de 3mm = 2 + 81 + 6 = 89
    const size = getPrintPageSizeMm(DEFAULT_LABEL_CONFIG);
    expect(size).toEqual({ width: 89, height: 15 });
  });

  it('com 1 coluna, a largura da página é só a etiqueta + a margem', () => {
    const size = getPrintPageSizeMm({ ...DEFAULT_LABEL_CONFIG, columnsPerRow: 1 });
    expect(size).toEqual({ width: 2 + 27, height: 15 }); // sem espaço entre colunas, já que só há uma
  });
});
