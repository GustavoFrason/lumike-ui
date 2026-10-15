/**
 * Utility functions for WhatsApp integration
 */

/** Só os dígitos (DDI + DDD + número), o formato que o wa.me aceita. */
export function normalizeWhatsappNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Número aceitável para o wa.me: vazio (não configurado) ou de 10 a 15
 * dígitos (E.164). Um número do Brasil com DDI tem 12 ou 13.
 */
export function isValidWhatsappNumber(phone: string): boolean {
  const digits = normalizeWhatsappNumber(phone);
  return digits.length === 0 || (digits.length >= 10 && digits.length <= 15);
}

/**
 * Link do wa.me com mensagem opcional. `null` quando não há número — quem
 * chama esconde o botão em vez de mandar o cliente para lugar nenhum.
 */
export function buildWhatsappUrl(
  phone: string | null | undefined,
  message?: string,
): string | null {
  const digits = normalizeWhatsappNumber(phone ?? '');
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

interface WhatsAppCollectionParams {
  customerName: string;
  customerPhone: string;
  amount: number;
  orderDate: string;
  pixKey?: string;
}

/**
 * Generates a WhatsApp collection message URL
 * @param params - Collection message parameters
 * @returns WhatsApp web URL with pre-filled message
 */
export function generateWhatsAppCollectionLink(params: WhatsAppCollectionParams): string {
  const { customerName, customerPhone, amount, orderDate, pixKey } = params;

  const cleanPhone = normalizeWhatsappNumber(customerPhone);

  // Format amount as currency
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  // Build message
  let message = `Olá, ${customerName}! Tudo bem? 😊\n\n`;
  message += `Estou passando para lembrar do seu débito na Lumilee de *${formattedAmount}* `;
  message += `referente à sua compra de ${orderDate}.\n\n`;
  message += `Podemos combinar o pagamento? `;

  if (pixKey?.trim()) {
    message += `\n\nSegue a chave Pix para facilitar:\n*${pixKey.trim()}*`;
  }

  message += `\n\nQualquer dúvida, estou à disposição! 💎✨`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Return WhatsApp Web URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
