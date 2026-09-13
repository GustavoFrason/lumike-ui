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
 * Preset de etiqueta: uma `LabelConfig` COMPLETA, nunca parcial. Clicar num
 * preset substitui o config inteiro (ver LabelPrintConfigPanel) — se um
 * preset pudesse omitir campos, eles ficariam com o valor do preset anterior
 * (ex: offsetX/columnGap calibrados pra bobina de 3 colunas da Joia vazando
 * silenciosamente pro preset "Padrão", que é outra etiqueta/impressora).
 */
export interface LabelTemplate extends LabelConfig {
  label: string;
}

/**
 * Config default da página: a etiqueta física já usada nas peças hoje —
 * bobina térmica Elgin/Zebra de 3 colunas, 27x15mm cada (ver preset "Joia"
 * abaixo, que reusa esta mesma constante — evita ter os dois valores
 * duplicados e desalinhando se um dia só um dos dois for ajustado).
 */
export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  width: 27,
  height: 15,
  fontSize: 8,
  qrSize: 40,
  showBranding: false,
  showProductName: false,
  offsetX: -4, // px — chute inicial pra ajuste fino na impressora
  offsetY: 2, // px — chute inicial pra ajuste fino na impressora
  // Bobina física usada tem 3 colunas de etiqueta lado a lado (9,2cm de
  // largura total): 2mm de margem em branco em cada borda + 3mm de espaço
  // entre uma etiqueta e a outra.
  columnGap: 3, // mm
  edgeMargin: 2, // mm
  columnsPerRow: 3,
};

/** Alinhamento/layout neutro pros presets que não têm uma bobina física calibrada. */
const NO_ALIGNMENT_ADJUSTMENT = {
  offsetX: 0,
  offsetY: 0,
  columnGap: 2,
  edgeMargin: 0,
  columnsPerRow: 1,
};

export const LABEL_TEMPLATES: LabelTemplate[] = [
  {
    label: 'Padrão (40x25)',
    width: 40,
    height: 25,
    fontSize: 9,
    qrSize: 55,
    showBranding: true,
    showProductName: true,
    ...NO_ALIGNMENT_ADJUSTMENT,
  },
  {
    label: 'Grande (60x40)',
    width: 60,
    height: 40,
    fontSize: 13,
    qrSize: 90,
    showBranding: true,
    showProductName: true,
    ...NO_ALIGNMENT_ADJUSTMENT,
  },
  {
    label: 'Pequena (30x15)',
    width: 30,
    height: 15,
    fontSize: 7,
    qrSize: 35,
    showBranding: true,
    showProductName: true,
    ...NO_ALIGNMENT_ADJUSTMENT,
  },
  // Etiqueta física comprada pra colar direto nas peças de joia — muito pequena
  // pra caber nome do produto e marca junto com QR + preço, então o preset já
  // desliga os dois (o campo de nome do produto vira ilegível nesse tamanho).
  { label: 'Joia (27x15)', ...DEFAULT_LABEL_CONFIG },
];

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
 * todas as colunas + os espaços entre elas), altura = uma fileira. Setado
 * explicitamente no `@page` (ver page.tsx) em vez de `size: auto` — "auto"
 * deixa a impressão usar o tamanho de página que já estiver configurado no
 * driver da impressora no Windows, que pode não bater com a largura real da
 * bobina; se não bater, o navegador quebra a fileira de etiquetas ao meio e,
 * como cada fileira vira uma "página" pro driver, a etiqueta que sobrou pra
 * próxima fileira pode nem chegar a ser impressa.
 */
export function getPrintPageSizeMm(config: LabelConfig): { width: number; height: number } {
  const width =
    config.edgeMargin +
    config.columnsPerRow * config.width +
    (config.columnsPerRow - 1) * config.columnGap;
  return { width, height: config.height };
}
