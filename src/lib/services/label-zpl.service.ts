import { getColumnLeftMm, type LabelConfig } from '@/app/admin/produtos/etiquetas/components/types';
import type { Product } from '@/lib/services/products.service';
import { formatCurrency } from '@/lib/formatters';

/**
 * Gerador de ZPL (Zebra Programming Language) pras etiquetas de QR Code —
 * caminho alternativo ao `window.print()` do navegador (ver
 * qz-print.service.ts): manda o comando direto pro motor de impressão da
 * Elgin L42 Pro, sem passar pela rasterização de página do Chrome, que é o
 * que causava QR borrado/etiqueta em branco em lotes grandes.
 *
 * v1: cobre exatamente o que é usado na prática hoje (config default da
 * Joia: só QR + SKU + preço, sem marca/nome/promocional riscado — ver
 * DEFAULT_LABEL_CONFIG em components/types.ts). Marca e nome do produto já
 * são suportados; preço promocional mostra só o valor com desconto (sem o
 * riscado do preço cheio), porque ZPL não tem um jeito nativo de riscar
 * texto — desenhar uma linha por cima é possível mas fica pra uma
 * iteração futura, já que esse recurso não é usado no formato real da
 * bobina hoje.
 */

/**
 * Resolução assumida da impressora: 203dpi (~8 dots/mm). É o padrão quase
 * universal pra impressoras térmicas de etiqueta de até 104mm de largura —
 * a aba "Linguagem Z" do L42PRO Utility mostra exatamente esse limite
 * (1~104mm) pra "Largura do papel", que é a faixa típica de impressoras
 * 203dpi desse porte. Nenhuma tela do utilitário expôs um número de DPI
 * explícito pra confirmar com certeza; se a calibração física mostrar TUDO
 * proporcionalmente maior ou menor (não só um desvio fixo), esse é o
 * primeiro número a revisar — o mais comum seria trocar pra 300.
 */
export const PRINTER_DPI = 203;
const DOTS_PER_MM = PRINTER_DPI / 25.4;
// A UI (LabelPrintConfigPanel) usa "px" assumindo 96dpi (padrão CSS) pra
// fontSize/qrSize/offset — converte direto pra dots nesse mesmo DPI.
const DOTS_PER_CSS_PX = PRINTER_DPI / 96;

function mm(value: number): number {
  return Math.round(value * DOTS_PER_MM);
}

function px(value: number): number {
  return Math.round(value * DOTS_PER_CSS_PX);
}

// Mesmo nível de correção de erro usado no preview (QRCodeSVG level="L" em
// LabelContent.tsx) — mantém o QR físico com a mesma "força" já testada
// visualmente ali. Formato exigido pelo ^FD do ^BQ: uma letra de correção
// de erro (L/M/Q/H) + "A" (modo de entrada automático) + vírgula + dado.
const QR_ERROR_CORRECTION = 'L';

/**
 * Gera o job ZPL inteiro pra uma lista de etiquetas: uma fileira física (um
 * bloco `^XA...^XZ`) a cada `columnsPerRow` produtos, na mesma ordem que a
 * grade CSS já usa (getLabelGridStyle) — o que já foi calibrado visualmente
 * no preview (offset, margem, espaço entre colunas) é reaplicado aqui em
 * dots, não uma lógica de posicionamento nova.
 */
export function generateLabelsZpl(labelList: Product[], config: LabelConfig): string {
  const rows: Product[][] = [];
  for (let i = 0; i < labelList.length; i += config.columnsPerRow) {
    rows.push(labelList.slice(i, i + config.columnsPerRow));
  }

  return rows.map((row) => generateRowZpl(row, config)).join('\n');
}

function generateRowZpl(row: Product[], config: LabelConfig): string {
  // Largura da página = onde a última coluna termina (soma de margem +
  // colunas anteriores + vãos reais até ali — ver getColumnLeftMm) + a
  // largura da própria última coluna.
  const pageWidthDots = mm(
    getColumnLeftMm(config, config.columnsPerRow - 1) + config.width,
  );
  const pageHeightDots = mm(config.height);

  const columns = row.map((product, column) => generateColumnZpl(product, column, config));

  return [
    '^XA',
    '^CI28', // UTF-8 — sem isso, acento (ç, ã, é...) em nome de produto sai errado
    `^PW${pageWidthDots}`,
    `^LL${pageHeightDots}`,
    '^LH0,0',
    ...columns,
    '^XZ',
  ].join('\n');
}

function generateColumnZpl(product: Product, column: number, config: LabelConfig): string {
  const columnLeftDots = mm(getColumnLeftMm(config, column));
  const padding = mm(1); // mesmo padding:1mm do bloco de impressão (page.tsx)

  // Mesmo deslocamento fino que LabelContent.tsx aplica via CSS transform,
  // reaplicado aqui em dots — não é recalibrado, é o valor já ajustado na
  // impressora física através do painel.
  const offsetXDots = px(config.offsetX);
  const offsetYDots = px(config.offsetY);

  const qrX = columnLeftDots + padding + offsetXDots;
  const qrY = padding + offsetYDots;
  // magnification (parâmetro "c" do ^BQ) não é "tamanho final em dots" —
  // é um multiplicador do tamanho de cada módulo do QR. Não dá pra bater
  // milimetricamente com qrSize (o nº de módulos varia com o tamanho do
  // SKU), então isso é só um ponto de partida proporcional — mesma lógica
  // dos outros campos desta tela: calibra vendo o resultado físico.
  const qrMagnification = Math.max(1, Math.min(10, Math.round(config.qrSize / 12)));
  const qrValue = zplEscape(product.sku || String(product.id));

  const lines = [
    `^FO${qrX},${qrY}`,
    `^BQN,2,${qrMagnification}`,
    `^FD${QR_ERROR_CORRECTION}A,${qrValue}^FS`,
  ];

  // Espaço à direita do QR pro texto — aproxima o gap-1.5 (6px) do flex do
  // preview (LabelContent.tsx). Sem `qrSize` em mm exato (depende de nº de
  // módulos, igual acima), usa a mesma estimativa de largura do preview.
  const textX = qrX + px(config.qrSize) + px(6);
  let textY = qrY;
  const lineGapDots = px(2);

  if (config.showBranding) {
    lines.push(
      `^FO${columnLeftDots + mm(config.width - 8)},${padding}`,
      `^A0N,${px(7)},${px(7)}`,
      '^FDLumilee^FS',
    );
  }

  if (config.showProductName) {
    const nameFontDots = px(config.fontSize);
    lines.push(`^FO${textX},${textY}`, `^A0N,${nameFontDots},${nameFontDots}`, `^FD${zplEscape(product.name)}^FS`);
    textY += nameFontDots + lineGapDots;
  }

  const skuFontDots = px(Math.max(7, config.fontSize - 3));
  lines.push(
    `^FO${textX},${textY}`,
    `^A0N,${skuFontDots},${skuFontDots}`,
    `^FD${zplEscape(product.sku || '')}^FS`,
  );
  textY += skuFontDots + lineGapDots;

  // Preço: mostra o promocional quando existir, sem o riscado do valor
  // cheio (ZPL não tem "line-through" nativo — ver comentário no topo).
  const priceFontDots = px(config.fontSize + 2);
  const priceValue = product.preco_promocional || product.price;
  lines.push(
    `^FO${textX},${textY}`,
    `^A0N,${priceFontDots},${priceFontDots}`,
    `^FD${zplEscape(formatCurrency(priceValue))}^FS`,
  );

  return lines.join('\n');
}

/**
 * `^`, `~` e `\` são delimitadores de comando/controle em ZPL — se um SKU
 * ou nome de produto tivesse um desses caracteres (incomum, mas possível),
 * ele quebraria o comando ZPL inteiro a partir dali. Remove em vez de tentar
 * escapar: não existe sequência de escape padrão pra `^`/`~` dentro de
 * `^FD` no ZPL II. Também troca o espaço não separável que
 * `Intl.NumberFormat('pt-BR')` insere (ex: "R$ 30,00") por espaço
 * normal — mesmo com `^CI28` (UTF-8), não vale o risco de um caractere
 * exótico não documentado quebrar o texto.
 */
function zplEscape(value: string): string {
  return value.replace(/[\^~\\]/g, '').replace(/ /g, ' ');
}
