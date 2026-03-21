/**
 * Utility functions for WhatsApp integration
 */

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

  // Format phone number (remove non-digits)
  const cleanPhone = customerPhone.replace(/\D/g, '');

  // Format amount as currency
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  // Build message
  let message = `Olá, ${customerName}! Tudo bem? 😊\n\n`;
  message += `Estou passando para lembrar do seu débito na Lumike de *${formattedAmount}* `;
  message += `referente à sua compra de ${orderDate}.\n\n`;
  message += `Podemos combinar o pagamento? `;

  if (pixKey) {
    message += `\n\nSegue a chave Pix para facilitar:\n*${pixKey}*`;
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
