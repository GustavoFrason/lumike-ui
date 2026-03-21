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
