import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from '@/lib/formatters';
import type { Product } from '@/lib/services/products.service';

/**
 * Exporta a lista de produtos pra um .xlsx com TODAS as colunas do produto
 * (não só o que aparece na tabela da tela) — pedido direto pra conferência/
 * planilha externa. Gera e baixa o arquivo inteiramente no navegador (a
 * mesma lib `xlsx` já usada no backend pra importação, só que aqui em modo
 * escrita — `XLSX.writeFile` cuida do download sozinho, sem precisar
 * montar link/Blob manualmente).
 *
 * Preço/custo saem como número puro (não "R$ X,XX" formatado) de propósito:
 * permite somar/filtrar direto no Excel sem precisar limpar a coluna antes.
 */
export function exportProductsToExcel(products: Product[]): void {
  const rows = products.map((p) => ({
    ID: p.id,
    SKU: p.sku ?? '',
    'SKU Zarpellon': p.sku2 ?? '',
    Nome: p.name,
    'Descrição Curta': p.short_description ?? '',
    Descrição: p.description ?? '',
    Slug: p.slug ?? '',
    Categoria: p.categories?.name ?? '',
    'ID Categoria': p.category_id ?? '',
    'ID Fornecedor': p.supplier_id ?? '',
    Coleção: p.collection ?? '',
    'ID Coleção': p.colecao_id ?? '',
    Preço: p.price,
    'Preço Promocional': p.preco_promocional ?? '',
    'Preço de Custo': p.cost_price ?? '',
    'Estoque Atual': p.current_stock,
    'Estoque Mínimo': p.min_stock,
    'Data de Compra': p.purchase_date ? formatDate(p.purchase_date) : '',
    Ativo: p.is_active ? 'Sim' : 'Não',
    Destaque: p.is_featured ? 'Sim' : 'Não',
    'Criado em': p.created_at ? formatDateTime(p.created_at) : '',
    'Atualizado em': p.updated_at ? formatDateTime(p.updated_at) : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `produtos-${today}.xlsx`);
}
