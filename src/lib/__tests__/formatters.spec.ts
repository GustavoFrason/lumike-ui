import { formatCurrency, formatDate, formatDateTime, parseCurrencyBR } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format a positive number correctly', () => {
      // Use localized space (\xa0) if Intl uses it
      const result = formatCurrency(1234.56).replace(/\xa0/g, ' ');
      expect(result).toBe('R$ 1.234,56');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0).replace(/\xa0/g, ' ');
      expect(result).toBe('R$ 0,00');
    });

    it('should format a negative number correctly', () => {
      const result = formatCurrency(-50).replace(/\xa0/g, ' ');
      expect(result).toContain('-R$');
      expect(result).toContain('50,00');
    });
  });

  describe('parseCurrencyBR', () => {
    it('converts a BR-formatted string back to a number', () => {
      expect(parseCurrencyBR('1.234,56')).toBe(1234.56);
    });

    it('handles a value with no thousands separator', () => {
      expect(parseCurrencyBR('39,99')).toBe(39.99);
    });

    it('returns 0 for empty, undefined or null input', () => {
      expect(parseCurrencyBR('')).toBe(0);
      expect(parseCurrencyBR(undefined)).toBe(0);
      expect(parseCurrencyBR(null)).toBe(0);
    });

    it('returns 0 for a non-numeric string instead of NaN', () => {
      expect(parseCurrencyBR('abc')).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format a string date correctly', () => {
      expect(formatDate('2023-12-25T12:00:00')).toBe('25/12/2023');
    });

    it('should format a Date object correctly', () => {
      const date = new Date(2023, 11, 25, 12); // Month is 0-indexed (11 = Dec)
      expect(formatDate(date)).toBe('25/12/2023');
    });
  });

  describe('formatDateTime', () => {
    it('should format a string date and time correctly', () => {
      // Mocking time zone to ensure consistent results in tests is hard with Intl,
      // but we can check the format pattern.
      const result = formatDateTime('2023-12-25T15:30:00');
      // allow optional comma/space variation in Intl output
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4},? \d{2}:\d{2}/);
    });
  });
});
