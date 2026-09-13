import type { CSSProperties } from 'react';

export interface LabelConfig {
  width: number; // mm
  height: number; // mm
  fontSize: number; // px
  qrSize: number; // px (visual)
  showBranding: boolean;
  showProductName: boolean;
  offsetX: number; // px (visual) — desloca a etiqueta inteira (QR + textos), ajuste fino de alinhamento
  offsetY: number; // px (visual) — desloca a etiqueta inteira (QR + textos), ajuste fino de alinhamento
  /**
   * Espaço em branco entre cada par de colunas vizinhas, em mm — um valor
   * POR VÃO, não um número único pra todos. `columnGaps[0]` é o espaço
   * entre a coluna 1 e a 2, `columnGaps[1]` entre a 2 e a 3, e assim por
   * diante. Tamanho sempre `columnsPerRow - 1` (pedido direto do usuário:
   * o vão real entre etiquetas nem sempre é igual em todos os pontos da
   * bobina). Ver getColumnLeftMm — é ele que soma esses vãos pra achar onde
   * cada coluna começa; getLabelGridStyle usa o mesmo array pra montar as
   * "colunas de espaço" do CSS Grid (Grid não tem um jeito nativo de variar
   * o `column-gap` por vão, só um valor único pra tudo).
   */
  columnGaps: number[];
  rowGap: number; // mm — distância entre uma fileira de etiquetas e a de baixo
  edgeMargin: number; // mm — margem em branco antes da primeira coluna
  /**
   * Nº de colunas físicas da bobina/etiqueta usada. NÃO é "quantas etiquetas
   * cabem", é uma propriedade FIXA do papel (a bobina Elgin/Zebra da Joia
   * tem 3 colunas lado a lado, sempre, não importa quantas etiquetas você
   * pediu pra imprimir hoje). Ver getLabelGridStyle/getPrintPageSizeMm: o
   * layout (grid) e o tamanho de página de impressão são forçados a partir
   * daqui — sem isso, o navegador/driver "adivinham" quantas cabem por
   * fileira usando a largura da janela (preview) ou o tamanho de página já
   * configurado na impressora (impressão), e se esse chute não bater com 3,
   * uma etiqueta quebra pra próxima fileira e a impressora pode nem chegar
   * a imprimi-la (cada fileira vira uma "página" pro driver).
   */
  columnsPerRow: number;
}

/**
 * Chute inicial pro único formato de etiqueta usado na prática: a bobina
 * térmica Elgin/Zebra de 3 colunas, 27x15mm cada, colada direto nas peças de
 * joia. Esses valores físicos (largura/altura/espaços/margem) viraram opção
 * editável de novo no painel (LabelPrintConfigPanel) — a calibração real na
 * impressora mostrou que precisam de ajuste fino continuado (drift entre
 * colunas, offset de página etc.), então travar tudo como constante fixa
 * atrapalhava mais do que ajudava.
 */
export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  width: 27,
  height: 15,
  fontSize: 10,
  qrSize: 45,
  showBranding: false,
  showProductName: false,
  offsetX: -4, // px — ajuste fino de alinhamento calibrado na impressora
  offsetY: 2, // px — ajuste fino de alinhamento calibrado na impressora
  // Bobina física usada tem 3 colunas de etiqueta lado a lado (9,2cm de
  // largura total): 2mm de margem em branco em cada borda + 3mm de espaço
  // entre uma etiqueta e a outra (um valor por vão — ver comentário no tipo).
  columnGaps: [3, 3], // mm
  rowGap: 0, // mm
  edgeMargin: 2, // mm
  columnsPerRow: 3,
};

/**
 * Valor padrão pro vão entre colunas quando `columnsPerRow` aumenta e
 * precisa de mais entradas em `columnGaps` — reusa o último vão já
 * configurado (ou 3mm, se ainda não houver nenhum) em vez de inventar um
 * número novo do nada.
 */
export function resizeColumnGaps(current: number[], columnsPerRow: number): number[] {
  const needed = Math.max(0, columnsPerRow - 1);
  const fallback = current[current.length - 1] ?? 3;
  const next = current.slice(0, needed);
  while (next.length < needed) next.push(fallback);
  return next;
}

/**
 * Posição (mm, a partir da borda esquerda da bobina) onde a coluna `column`
 * (0-indexada) começa — soma a margem da borda + a largura de cada coluna
 * anterior + o vão real até ela. Usada tanto pelo gerador de ZPL (que
 * precisa de coordenadas absolutas, sem CSS Grid) quanto — indiretamente —
 * pela lógica de getPrintPageSizeMm.
 */
export function getColumnLeftMm(config: LabelConfig, column: number): number {
  let left = config.edgeMargin;
  for (let i = 0; i < column; i++) {
    left += config.width + (config.columnGaps[i] ?? 0);
  }
  return left;
}

/**
 * Estilo do container que dispõe as etiquetas lado a lado. Preview (tela) e
 * impressão de verdade usam exatamente esta função — assim o que aparece no
 * preview sempre bate com o que sai na impressora, nunca diverge de novo.
 *
 * Usa CSS Grid com colunas FIXAS (não `flex-wrap`, que deixa a quantidade
 * por fileira à mercê da largura disponível do contêiner/página). Como cada
 * vão pode ter um tamanho diferente (`columnGaps`), e o CSS Grid não tem um
 * `column-gap` que varie por vão, a lista de colunas intercala "coluna de
 * conteúdo" e "coluna de vão": `27mm 1mm 27mm 3mm 27mm` em vez de
 * `repeat(3, 27mm)` + `column-gap` único. Cada etiqueta precisa então ser
 * posicionada explicitamente na track de conteúdo certa — ver
 * getLabelGridColumn, usado no `style` de cada item (LabelPreviewGrid.tsx,
 * page.tsx).
 */
export function getLabelGridStyle(config: LabelConfig): CSSProperties {
  const tracks: string[] = [];
  for (let i = 0; i < config.columnsPerRow; i++) {
    tracks.push(`${config.width}mm`);
    if (i < config.columnsPerRow - 1) {
      tracks.push(`${config.columnGaps[i] ?? 0}mm`);
    }
  }

  return {
    display: 'grid',
    gridTemplateColumns: tracks.join(' '),
    rowGap: `${config.rowGap}mm`,
    paddingLeft: `${config.edgeMargin}mm`,
  };
}

/**
 * Em qual track de `getLabelGridStyle` a coluna `column` (0-indexada) cai —
 * como as tracks intercalam conteúdo/vão, a track de conteúdo da coluna N é
 * sempre `2N + 1` (1-indexado, do jeito que `grid-column-start` espera).
 */
export function getLabelGridColumn(column: number): number {
  return column * 2 + 1;
}

/**
 * Tamanho de página de impressão (mm): largura = a bobina inteira (margem +
 * todas as colunas + a soma de todos os vãos entre elas), altura = uma
 * fileira. NÃO é setado no `@page` (ver comentário em page.tsx: o Chrome não
 * respeita um tamanho de página forçado por CSS numa impressora física de
 * verdade, só ao salvar PDF) — serve só de dica exibida pro usuário, pro
 * papel personalizado ser cadastrado com esse valor direto no driver da
 * impressora no Windows.
 */
export function getPrintPageSizeMm(config: LabelConfig): { width: number; height: number } {
  const width = getColumnLeftMm(config, config.columnsPerRow - 1) + config.width;
  return { width, height: config.height };
}
