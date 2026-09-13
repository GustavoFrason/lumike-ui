/**
 * Ponte com o QZ Tray (https://qz.io) — programinha local que precisa estar
 * instalado e rodando no computador ligado à impressora térmica. O navegador
 * não consegue escrever bytes crus numa porta USB sozinho; o QZ Tray abre um
 * WebSocket local (localhost:8181/8182) que só uma página no MESMO
 * computador consegue acessar, e repassa o comando pra impressora sem passar
 * pelo pipeline de imagem/página do Chrome (que é o que causa a corrupção em
 * lotes grandes — ver comentário em getPrintPageSizeMm, types.ts).
 *
 * Import de `qz-tray` é sempre feito sob demanda (dentro das funções, não no
 * topo do arquivo): a biblioteca assume `window`/`WebSocket` disponíveis no
 * carregamento do módulo, o que quebraria a renderização no servidor
 * (Next.js faz SSR por padrão) se fosse importada estaticamente aqui.
 */

import type * as QzTray from 'qz-tray';
import type { LabelConfig } from '@/app/admin/produtos/etiquetas/components/types';
import type { Product } from '@/lib/services/products.service';
import { generateLabelsZpl } from './label-zpl.service';

export type QzConnectionStatus = 'not-installed' | 'connected' | 'error';

export interface QzConnectionResult {
  status: QzConnectionStatus;
  printers?: string[];
  message: string;
}

export interface QzPrintResult {
  success: boolean;
  message: string;
}

async function loadQz(): Promise<typeof QzTray> {
  return import('qz-tray');
}

/**
 * Conecta no QZ Tray local e lista as impressoras que ele enxerga — usado
 * como diagnóstico antes de confiar na impressão de verdade: se isso falhar,
 * nada mais adiante vai funcionar (QZ Tray não instalado/não rodando, ou
 * rodando mas sem permissão).
 */
export async function testQzConnection(): Promise<QzConnectionResult> {
  try {
    const qz = await loadQz();

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    // Sem argumento, find() sempre resolve com a lista inteira (string[]) —
    // a variante "string" só acontece quando se passa uma query buscando UM
    // nome específico.
    const found = await qz.printers.find();
    const printers = Array.isArray(found) ? found : [found];
    return {
      status: 'connected',
      printers,
      message: `Conectado ao QZ Tray. ${printers.length} impressora(s) encontrada(s).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // QZ Tray não instalado/não rodando derruba a conexão do WebSocket —
    // essa é a mensagem de erro típica do navegador nesse caso.
    const looksLikeNotRunning = /WebSocket|connect|ECONNREFUSED/i.test(message);
    return {
      status: looksLikeNotRunning ? 'not-installed' : 'error',
      message: looksLikeNotRunning
        ? 'Não consegui conectar ao QZ Tray. Confirme que ele está instalado e rodando (ícone na bandeja do sistema) neste computador.'
        : `Erro ao conectar no QZ Tray: ${message}`,
    };
  }
}

/**
 * Envia um comando bruto (ZPL, tipicamente) direto pra impressora via QZ
 * Tray — sem passar pelo `window.print()` do navegador.
 */
export async function printRawToQz(printerName: string, rawData: string): Promise<void> {
  const qz = await loadQz();

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  const config = qz.configs.create(printerName);
  // type "raw" + format "command": manda o texto (ZPL) direto pro motor de
  // comando da impressora, sem reinterpretar como imagem/pixel — é isso que
  // evita o pipeline de rasterização do Chrome que causava a corrupção em
  // lotes grandes.
  await qz.print(config, [{ type: 'raw', format: 'command', flavor: 'plain', data: rawData }]);
}

/**
 * Impressora não é hardcoded pelo nome exato do Windows ("ELGIN L42PRO
 * FULL") pra não quebrar se um dia o nome mudar (reinstalação do driver,
 * outro computador) — busca por "elgin" no que o QZ Tray encontrar.
 */
function findElginPrinter(printers: string[]): string | undefined {
  return printers.find((p) => p.toLowerCase().includes('elgin'));
}

/**
 * Fluxo completo do botão "Imprimir via QZ Tray": conecta, acha a
 * impressora Elgin entre as que o QZ Tray enxerga, gera o ZPL a partir da
 * mesma config já calibrada na tela (LabelConfig) e manda imprimir.
 */
export async function printLabelsViaQz(
  labelList: Product[],
  config: LabelConfig,
): Promise<QzPrintResult> {
  try {
    const qz = await loadQz();

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const found = await qz.printers.find();
    const printers = Array.isArray(found) ? found : [found];
    const printerName = findElginPrinter(printers);

    if (!printerName) {
      return {
        success: false,
        message:
          printers.length === 0
            ? 'QZ Tray não encontrou nenhuma impressora. Confirme que a Elgin está ligada e instalada no Windows.'
            : `Nenhuma impressora "Elgin" encontrada. Disponíveis: ${printers.join(', ')}.`,
      };
    }

    const zpl = generateLabelsZpl(labelList, config);
    await printRawToQz(printerName, zpl);

    return { success: true, message: `Enviado para "${printerName}" via QZ Tray.` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Erro ao imprimir via QZ Tray: ${message}` };
  }
}
