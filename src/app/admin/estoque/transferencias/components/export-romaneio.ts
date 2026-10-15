import * as XLSX from 'xlsx';
import { formatDateTime } from '@/lib/formatters';
import type { TransferBatchDetail } from '@/lib/services/transfer-batches.service';
import { batchLocationLabel, summarizeItems } from './transfer-preview';

/**
 * Baixa o romaneio do lote em .xlsx: cabeçalho do lote nas primeiras
 * linhas e a lista de peças (Código, Zarpellon, Peça, Qtd, Preço,
 * Subtotal) com o total no fim.
 */
export function exportRomaneioToExcel(batch: TransferBatchDetail): void {
  const totals = summarizeItems(batch.items);

  const rows: (string | number)[][] = [
    [`Romaneio — transferência #${batch.id}`],
    ['Data', formatDateTime(batch.created_at)],
    ['Origem', batchLocationLabel(batch.from_user_id, batch.from_name)],
    ['Destino', batchLocationLabel(batch.to_user_id, batch.to_name)],
    ['Observação', batch.notes ?? ''],
    ['Feito por', batch.created_by_name ?? ''],
    [],
    ['Código', 'Zarpellon', 'Peça', 'Qtd', 'Preço', 'Subtotal'],
    ...batch.items.map((item) => [
      item.sku ?? '',
      item.sku2 ?? '',
      item.name,
      item.quantity,
      item.price,
      item.quantity * item.price,
    ]),
    [],
    ['Total', '', `${totals.pieces} itens`, totals.units, '', totals.value],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 40 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Romaneio');
  XLSX.writeFile(workbook, `romaneio-transferencia-${batch.id}.xlsx`);
}
