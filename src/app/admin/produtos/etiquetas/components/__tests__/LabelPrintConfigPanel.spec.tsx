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

  it('limita o deslocamento a metade da largura física (px) mesmo se a pessoa digitar mais', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Horiz. (px)') as HTMLInputElement;

    // DEFAULT_LABEL_CONFIG.width = 27mm -> limite = round(27 * 96/25.4 / 2) = 51px
    fireEvent.change(input, { target: { value: '-1000' } });

    expect(input.value).toBe('-51');
  });

  it('o limite de deslocamento é proporcional ao tamanho de etiqueta configurado', () => {
    // Não há mais preset pra trocar de tamanho em tela (só existe a bobina
    // Elgin 27x15mm na prática), mas a fórmula do limite (maxOffsetFor)
    // continua genérica — outro `width` no config precisa escalar o limite
    // junto, não deixar um número fixo.
    render(<Harness initial={{ ...DEFAULT_LABEL_CONFIG, width: 60, offsetX: 0 }} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Horiz. (px)') as HTMLInputElement;

    // 60mm -> limite = round(60 * 96/25.4 / 2) = 113px, bem maior que o da Joia (51px)
    fireEvent.change(input, { target: { value: '-1000' } });

    expect(input.value).toBe('-113');
  });

  it('reverte para o último valor válido ao sair do campo vazio', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Deslocar Etiqueta — Vert. (px)') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input.value).toBe('2'); // valor original de DEFAULT_LABEL_CONFIG.offsetY
  });

  it('avisa quando marca/nome do produto estão ligados na etiqueta pequena, e some ao desmarcar', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const warning = () => screen.queryByText(/é pequena — logo e\/ou nome do produto/);

    expect(warning()).not.toBeInTheDocument(); // config default já nasce com os dois desligados

    fireEvent.click(screen.getByLabelText('Nome do Produto'));
    expect(warning()).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Nome do Produto'));
    expect(warning()).not.toBeInTheDocument();
  });
});
