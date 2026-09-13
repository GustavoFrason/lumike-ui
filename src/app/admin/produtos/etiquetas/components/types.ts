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
  columnGap: number; // mm — espaço entre etiquetas lado a lado (bobina multi-coluna)
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
 * Único formato de etiqueta usado na prática: a bobina térmica Elgin/Zebra
 * de 3 colunas, 27x15mm cada, colada direto nas peças de joia — a impressora
 * (Elgin L42 Pro) só imprime nesse papel, então não existe mais um catálogo
 * de presets pra outros tamanhos (ver histórico do arquivo se precisar
 * reintroduzir um formato alternativo no futuro).
 */
export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  width: 27,
  height: 15,
  fontSize: 8,
  qrSize: 40,
  showBranding: false,
  showProductName: false,
  offsetX: -4, // px — ajuste fino de alinhamento calibrado na impressora
  offsetY: 2, // px — ajuste fino de alinhamento calibrado na impressora
  // Bobina física usada tem 3 colunas de etiqueta lado a lado (9,2cm de
  // largura total): 2mm de margem em branco em cada borda + 3mm de espaço
  // entre uma etiqueta e a outra.
  columnGap: 3, // mm
  edgeMargin: 2, // mm
  columnsPerRow: 3,
};

/**
 * Estilo do container que dispõe as etiquetas lado a lado. Preview (tela) e
 * impressão de verdade usam exatamente esta função — assim o que aparece no
 * preview sempre bate com o que sai na impressora, nunca diverge de novo.
 *
 * Usa CSS Grid com `columnsPerRow` colunas FIXAS (não `flex-wrap`, que deixa
 * a quantidade por fileira à mercê da largura disponível do contêiner/página
 * — exatamente o que fazia uma etiqueta "sumir" pra fileira de baixo quando
 * essa largura não batia com o número real de colunas da bobina).
 */
export function getLabelGridStyle(config: LabelConfig): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.columnsPerRow}, ${config.width}mm)`,
    columnGap: `${config.columnGap}mm`,
    rowGap: 0,
    paddingLeft: `${config.edgeMargin}mm`,
  };
}

/**
 * Tamanho de página de impressão (mm): largura = a bobina inteira (margem +
 * todas as colunas + os espaços entre elas), altura = uma fileira. NÃO é
 * setado no `@page` (ver comentário em page.tsx: o Chrome não respeita um
 * tamanho de página forçado por CSS numa impressora física de verdade, só ao
 * salvar PDF) — serve só de dica exibida pro usuário, pro papel personalizado
 * ser cadastrado com esse valor direto no driver da impressora no Windows.
 */
export function getPrintPageSizeMm(config: LabelConfig): { width: number; height: number } {
  const width =
    config.edgeMargin +
    config.columnsPerRow * config.width +
    (config.columnsPerRow - 1) * config.columnGap;
  return { width, height: config.height };
}
