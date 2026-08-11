export interface LabelConfig {
  width: number; // mm
  height: number; // mm
  fontSize: number; // px
  qrSize: number; // px (visual)
  showBranding: boolean;
}

export interface LabelTemplate {
  label: string;
  width: number;
  height: number;
  fontSize: number;
  qrSize: number;
}

export const LABEL_TEMPLATES: LabelTemplate[] = [
  { label: 'Padrão (40x25)', width: 40, height: 25, fontSize: 9, qrSize: 55 },
  { label: 'Grande (60x40)', width: 60, height: 40, fontSize: 13, qrSize: 90 },
  { label: 'Pequena (30x15)', width: 30, height: 15, fontSize: 7, qrSize: 35 },
];
