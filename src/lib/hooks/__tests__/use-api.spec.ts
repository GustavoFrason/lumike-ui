import { act, renderHook } from '@testing-library/react';
import { useApi } from '../use-api';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useApi', () => {
  it('keeps the newest response when an older one resolves later', async () => {
    const { result } = renderHook(() => useApi<string>());
    const slow = deferred<string>(); // busca "7"
    const fast = deferred<string>(); // busca "71"

    let first!: Promise<string>;
    let second!: Promise<string>;
    act(() => {
      first = result.current.execute(() => slow.promise);
      second = result.current.execute(() => fast.promise);
    });

    await act(async () => {
      fast.resolve('resultado 71');
      await second;
    });
    expect(result.current.data).toBe('resultado 71');
    expect(result.current.loading).toBe(false);

    await act(async () => {
      slow.resolve('resultado 7');
      await first;
    });
    expect(result.current.data).toBe('resultado 71');
  });

  it('ignores the error of a stale call', async () => {
    const { result } = renderHook(() => useApi<string>());
    const stale = deferred<string>();
    const fresh = deferred<string>();

    let first!: Promise<string>;
    let second!: Promise<string>;
    act(() => {
      first = result.current.execute(() => stale.promise);
      second = result.current.execute(() => fresh.promise);
    });

    await act(async () => {
      fresh.resolve('ok');
      await second;
    });
    await act(async () => {
      stale.reject(new Error('timeout'));
      await first.catch(() => undefined);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe('ok');
  });

  it('still returns the result to the caller of a stale call', async () => {
    const { result } = renderHook(() => useApi<string>());
    const stale = deferred<string>();

    let first!: Promise<string>;
    await act(async () => {
      first = result.current.execute(() => stale.promise);
      await result.current.execute(() => Promise.resolve('novo'));
      stale.resolve('antigo');
      await first;
    });

    await expect(first).resolves.toBe('antigo');
    expect(result.current.data).toBe('novo');
  });
});
