/**
 * @jest-environment node
 */
import { decodeJwtPayload, isJwtExpired } from '../jwt';

/** Monta um JWT falso (assinatura irrelevante aqui) com payload base64url. */
const fakeJwt = (payload: object) =>
  ['header', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');

describe('decodeJwtPayload', () => {
  it('decodes the payload', () => {
    expect(decodeJwtPayload(fakeJwt({ sub: 7, email: 'a@b.com', role: 'admin' }))).toEqual({
      sub: 7,
      email: 'a@b.com',
      role: 'admin',
    });
  });

  it('handles base64url characters and UTF-8 (nomes com acento)', () => {
    // "?>" e "ÿ" geram '-' / '_' em base64url
    const payload = { email: 'joão@ex.com', x: '?>?>ÿÿ' };
    expect(decodeJwtPayload(fakeJwt(payload))).toEqual(payload);
  });

  it('returns null for missing or malformed tokens', () => {
    expect(decodeJwtPayload(undefined)).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload('semponto')).toBeNull();
    expect(decodeJwtPayload('a.!!!naoebase64.c')).toBeNull();
  });
});

describe('isJwtExpired', () => {
  const now = Date.UTC(2026, 9, 9, 12, 0, 0);
  const nowSec = now / 1000;

  it('is expired when exp is in the past', () => {
    expect(isJwtExpired({ exp: nowSec - 1 }, now)).toBe(true);
  });

  it('is valid when exp is in the future', () => {
    expect(isJwtExpired({ exp: nowSec + 3600 }, now)).toBe(false);
  });

  it('treats a token without exp as not expired', () => {
    expect(isJwtExpired({}, now)).toBe(false);
  });
});
