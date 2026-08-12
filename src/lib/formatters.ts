/**
 * formatters.ts
 * ------------------------------------
 * Funções utilitárias para formatação de dados.
 */

/**
 * Formata um número como moeda brasileira
 */
export function formatCurrency(value: number, hideZeroCents: boolean = false): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  if (hideZeroCents && formatted.endsWith(',00')) {
    return formatted.replace(',00', '');
  }

  return formatted;
}

/**
 * Converte uma string de moeda BR (ex: "1.234,56", vinda do CurrencyInputATM)
 * de volta para número. Estava duplicada em 5 telas (produtos, vendas,
 * compras, contas a pagar, compra de acessórios) — cada uma com sua própria
 * cópia de `.replace(/\./g, '').replace(',', '.')`.
 */
export function parseCurrencyBR(value: string | undefined | null): number {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Formata uma data com hora
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * "Hoje" no fuso de Brasília (America/Sao_Paulo — sem horário de verão
 * desde 2019, sempre UTC-3), no formato 'YYYY-MM-DD' pronto pra um
 * `<input type="date">`.
 *
 * `new Date().toISOString().slice(0, 10)` (o jeito mais comum de pegar
 * "hoje") usa UTC, não o fuso do navegador nem o de Brasília — perto da
 * meia-noite local já vira o dia seguinte em UTC, e servidor pode rodar em
 * datacenter de outro fuso. `Intl.DateTimeFormat('en-CA', ...)` resolve os
 * dois problemas de uma vez: fixa o fuso explicitamente e o locale 'en-CA'
 * já formata como YYYY-MM-DD nativamente, sem montar a string na mão.
 */
export function getTodayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
