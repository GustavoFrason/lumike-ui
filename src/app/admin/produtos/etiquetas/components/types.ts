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

export interface LabelTemplate {
  label: string;
  width: number;
  height: number;
  fontSize: number;
  qrSize: number;
  showBranding?: boolean;
  showProductName?: boolean;
}

export const LABEL_TEMPLATES: LabelTemplate[] = [
  { label: 'Padrão (40x25)', width: 40, height: 25, fontSize: 9, qrSize: 55 },
  { label: 'Grande (60x40)', width: 60, height: 40, fontSize: 13, qrSize: 90 },
  { label: 'Pequena (30x15)', width: 30, height: 15, fontSize: 7, qrSize: 35 },
  // Etiqueta física comprada pra colar direto nas peças de joia — muito pequena
  // pra caber nome do produto e marca junto com QR + preço, então o preset já
  // desliga os dois (o campo de nome do produto vira ilegível nesse tamanho).
  {
    label: 'Joia (27x15)',
    width: 27,
    height: 15,
    fontSize: 8,
    qrSize: 40,
    showBranding: false,
    showProductName: false,
  },
];
