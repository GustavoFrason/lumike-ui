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
};

/** Alinhamento neutro pros presets que não têm uma bobina física calibrada. */
const NO_ALIGNMENT_ADJUSTMENT = { offsetX: 0, offsetY: 0, columnGap: 2, edgeMargin: 0 };

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
 */
export function getLabelGridStyle(config: LabelConfig): CSSProperties {
  return {
    columnGap: `${config.columnGap}mm`,
    rowGap: 0,
    paddingLeft: `${config.edgeMargin}mm`,
  };
}
