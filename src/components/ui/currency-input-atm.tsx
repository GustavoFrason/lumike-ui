'use client';

import CurrencyInput, { CurrencyInputProps } from 'react-currency-input-field';

/**
 * CurrencyInputATM
 * ------------------------------------
 * Um wrapper para o CurrencyInput que implementa a máscara de "caixa eletrônico" (ATM).
 * Ao digitar números, eles preenchem da direita para a esquerda (decimais primeiro).
 * Exemplo: 1050 -> R$ 10,50
 *
 * A máscara é aplicada via `transformRawValue`, que recebe o texto bruto que
 * está de fato no <input> antes de qualquer parsing da lib. É o único hook
 * que reflete as teclas digitadas de verdade.
 *
 * Versão anterior recalculava o valor a partir de `values.value` (já
 * formatado, vindo do `onValueChange`) e devolvia isso como o novo `value`
 * controlado — cada tecla reformatava em cima do resultado da tecla
 * anterior, e `parseInt()` truncava tudo a partir da vírgula. Resultado:
 * o campo nunca saía de 0,00 (bug real reportado testando o form local).
 */
export function CurrencyInputATM(props: CurrencyInputProps) {
  const decimalSeparator = props.decimalSeparator || ',';

  const transformRawValue = (rawValue: string) => {
    // Mantém só os dígitos realmente digitados (descarta "R$", ".", "," etc.)
    const digitsOnly = rawValue.replace(/\D/g, '');
    if (!digitsOnly) return '';

    // Os últimos 2 dígitos são sempre os centavos.
    const padded = digitsOnly.padStart(3, '0');
    const cents = padded.slice(-2);
    const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, '');

    return `${integer}${decimalSeparator}${cents}`;
  };

  return (
    <CurrencyInput
      {...props}
      transformRawValue={props.transformRawValue || transformRawValue}
      decimalSeparator={decimalSeparator}
      groupSeparator={props.groupSeparator || '.'}
      intlConfig={props.intlConfig || { locale: 'pt-BR', currency: 'BRL' }}
    />
  );
}
