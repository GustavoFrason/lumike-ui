import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CurrencyInputATM } from '../currency-input-atm';
import { parseCurrencyBR } from '@/lib/formatters';

/**
 * Espelha o uso real (ProductPricingSection): valor controlado vindo do
 * banco como "49,5" (Number.toString com vírgula) e `onValueChange`
 * gravando de volta no estado.
 */
function Harness({ initial, onValue }: { initial: string; onValue?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <CurrencyInputATM
      aria-label="preço"
      value={value}
      decimalsLimit={2}
      prefix="R$ "
      onValueChange={(v) => {
        setValue(v || '');
        onValue?.(v || '');
      }}
    />
  );
}

const input = () => screen.getByLabelText('preço') as HTMLInputElement;
/** O Intl usa espaço especial (NBSP) depois do "R$"; compara sem ligar pra isso. */
const shownValue = () => input().value.replace(/\s+/g, ' ');

describe('CurrencyInputATM', () => {
  it.each([
    ['49,5', 'R$ 49,50', 49.5],
    ['159,9', 'R$ 159,90', 159.9],
    ['12', 'R$ 12,00', 12],
  ])(
    'valor do banco %s aparece com 2 casas e não perde dígito ao sair do campo',
    (initial, shown, number) => {
      const onValue = jest.fn();
      render(<Harness initial={initial} onValue={onValue} />);

      expect(shownValue()).toBe(shown);

      fireEvent.focus(input());
      fireEvent.blur(input());

      expect(shownValue()).toBe(shown);
      const last = onValue.mock.calls.at(-1)?.[0];
      if (last !== undefined) expect(parseCurrencyBR(last)).toBe(number);
    },
  );

  it('continua preenchendo da direita para a esquerda ao digitar (1050 → 10,50)', () => {
    render(<Harness initial="" />);

    fireEvent.change(input(), { target: { value: '1' } });
    expect(shownValue()).toBe('R$ 0,01');
    fireEvent.change(input(), { target: { value: 'R$ 0,010' } });
    expect(shownValue()).toBe('R$ 0,10');
    fireEvent.change(input(), { target: { value: 'R$ 0,105' } });
    expect(shownValue()).toBe('R$ 1,05');
    fireEvent.change(input(), { target: { value: 'R$ 1,050' } });
    expect(shownValue()).toBe('R$ 10,50');

    fireEvent.blur(input());
    expect(shownValue()).toBe('R$ 10,50');
  });

  it('editar um valor que veio com 1 casa adiciona o dígito nos centavos', () => {
    render(<Harness initial="49,5" />);

    // Campo mostra "R$ 49,50"; digitar "1" no fim desloca como no caixa
    fireEvent.change(input(), { target: { value: 'R$ 49,501' } });
    expect(shownValue()).toBe('R$ 495,01');
  });
});
