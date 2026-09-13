import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LabelPrintConfigPanel } from '../LabelPrintConfigPanel';
import { DEFAULT_LABEL_CONFIG, LabelConfig } from '../types';

/**
 * Espelha como a página de verdade usa o painel: `config` num `useState`
 * real, pra reproduzir o re-render controlado que causa (ou não, depois do
 * fix) o bug de digitar número negativo.
 */
function Harness({ initial }: { initial: LabelConfig }) {
  const [config, setConfig] = useState(initial);
  return <LabelPrintConfigPanel config={config} onConfigChange={setConfig} />;
}

describe('LabelPrintConfigPanel', () => {
  it('deixa digitar um deslocamento negativo dígito por dígito sem resetar pra 0', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Horiz. (px)') as HTMLInputElement;
    expect(input.value).toBe('-4');

    // Simula limpar o campo e digitar "-12" caractere por caractere — é
    // assim que um <input type=number> real reporta o valor a cada tecla.
    fireEvent.change(input, { target: { value: '' } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { value: '-' } });
    expect(input.value).toBe('-'); // antes do fix, isso virava "0"

    fireEvent.change(input, { target: { value: '-1' } });
    expect(input.value).toBe('-1');

    fireEvent.change(input, { target: { value: '-12' } });
    expect(input.value).toBe('-12');
  });

  it('limita o deslocamento a [-20, 20] mesmo se a pessoa digitar um valor maior', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Horiz. (px)') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '-40' } });

    expect(input.value).toBe('-20');
  });

  it('reverte para o último valor válido ao sair do campo vazio', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Vert. (px)') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input.value).toBe('2'); // valor original de DEFAULT_LABEL_CONFIG.offsetY
  });

  it('trocar de preset substitui a configuração inteira, sem vazar campos do preset anterior', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);

    // DEFAULT_LABEL_CONFIG é a "Joia (27x15)": branding e nome desligados,
    // offsetX/columnGap calibrados pra bobina de 3 colunas.
    expect(screen.queryByLabelText('Logo Lumilee')).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Padrão (40x25)' }));

    expect(screen.getByLabelText('Largura (mm)')).toHaveValue('40');
    expect(screen.getByLabelText('Logo Lumilee')).toBeChecked();
    expect(screen.getByLabelText('Nome do Produto')).toBeChecked();
    expect(screen.getByLabelText('Deslocar Etiqueta — Horiz. (px)')).toHaveValue('0');
    expect(screen.getByLabelText('Espaço entre colunas (mm)')).toHaveValue('2');
  });

  it('avisa quando a etiqueta é pequena demais pra nome/marca, e some ao desmarcar', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const warning = () => screen.queryByText(/é pequena — logo e\/ou nome do produto/);

    expect(warning()).not.toBeInTheDocument(); // Joia já nasce com os dois desligados

    fireEvent.click(screen.getByLabelText('Nome do Produto'));
    expect(warning()).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Nome do Produto'));
    expect(warning()).not.toBeInTheDocument();
  });
});
