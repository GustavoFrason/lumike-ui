export type LeadFormField = 'email' | 'name' | 'birthday' | 'whatsapp';

/**
 * Valida um campo do formulário de captura de lead. Retorna a mensagem de
 * erro (string) ou string vazia se válido.
 */
export function validateLeadField(name: string, value: string): string {
  let error = '';
  if (name === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) error = 'Por favor, insira um email válido (ex: nome@email.com).';
  }
  if (name === 'name') {
    if (value.trim().split(' ').length < 2) error = 'Por favor, insira seu nome e sobrenome.';
  }
  if (name === 'birthday') {
    if (value.length !== 10) {
      error = 'A data deve estar completa (DD/MM/AAAA).';
    } else {
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();

      if (date > today) {
        error = 'A data de nascimento não pode estar no futuro.';
      } else if (
        date.getFullYear() < 1900 ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        error = 'Data inválida.';
      }
    }
  }
  if (name === 'whatsapp') {
    if (value.length < 14) error = 'Digite o WhatsApp completo com DDD.';
  }

  return error;
}
