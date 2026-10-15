import {
  buildWhatsappUrl,
  generateWhatsAppCollectionLink,
  isValidWhatsappNumber,
  normalizeWhatsappNumber,
} from '../whatsapp';

describe('normalizeWhatsappNumber', () => {
  it('keeps only digits', () => {
    expect(normalizeWhatsappNumber('+55 (11) 98765-4321')).toBe('5511987654321');
  });
});

describe('isValidWhatsappNumber', () => {
  it('accepts empty (not configured) and 10 to 15 digits', () => {
    expect(isValidWhatsappNumber('')).toBe(true);
    expect(isValidWhatsappNumber('+55 11 98765-4321')).toBe(true);
    expect(isValidWhatsappNumber('551198765432')).toBe(true);
  });

  it('rejects numbers too short or too long', () => {
    expect(isValidWhatsappNumber('98765-4321')).toBe(false);
    expect(isValidWhatsappNumber('1234567890123456')).toBe(false);
  });
});

describe('buildWhatsappUrl', () => {
  it('returns null when there is no number', () => {
    expect(buildWhatsappUrl('')).toBeNull();
    expect(buildWhatsappUrl(null)).toBeNull();
    expect(buildWhatsappUrl(' - ')).toBeNull();
  });

  it('builds the wa.me link with the encoded message', () => {
    expect(buildWhatsappUrl('+55 11 98765-4321', 'Olá & tchau')).toBe(
      'https://wa.me/5511987654321?text=Ol%C3%A1%20%26%20tchau',
    );
  });

  it('omits the text param without a message', () => {
    expect(buildWhatsappUrl('5511987654321')).toBe('https://wa.me/5511987654321');
  });
});

describe('generateWhatsAppCollectionLink', () => {
  const base = {
    customerName: 'Ana',
    customerPhone: '(11) 98765-4321',
    amount: 150,
    orderDate: '10/10/2026',
  };

  const messageOf = (url: string) => decodeURIComponent(url.split('?text=')[1]);

  it('includes the Pix key when configured', () => {
    const url = generateWhatsAppCollectionLink({ ...base, pixKey: ' loja@pix.com ' });
    expect(url.startsWith('https://wa.me/11987654321?text=')).toBe(true);
    expect(messageOf(url)).toContain('*loja@pix.com*');
  });

  it('leaves the Pix line out when the key is blank', () => {
    const url = generateWhatsAppCollectionLink({ ...base, pixKey: '  ' });
    expect(messageOf(url)).not.toContain('chave Pix');
  });
});
