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
  return (
    <LabelPrintConfigPanel
      config={config}
      onConfigChange={setConfig}
      onReset={() => setConfig(initial)}
    />
  );
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

  it('não avisa numa etiqueta grande mesmo com marca/nome ligados', () => {
    // O aviso é só pro formato pequeno (27x15) — numa etiqueta maior, nome e
    // marca cabem numa boa, não faz sentido mostrar o alerta.
    render(
      <Harness initial={{ ...DEFAULT_LABEL_CONFIG, width: 60, height: 40, showBranding: true }} />,
    );
    expect(screen.queryByText(/é pequena — logo e\/ou nome do produto/)).not.toBeInTheDocument();
  });

  it('largura e altura da etiqueta são editáveis e refletem no valor exibido', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);

    const width = screen.getByLabelText('Largura da etiqueta (mm)') as HTMLInputElement;
    const height = screen.getByLabelText('Altura da etiqueta (mm)') as HTMLInputElement;
    expect(width.value).toBe('27');
    expect(height.value).toBe('15');

    fireEvent.change(width, { target: { value: '30' } });
    fireEvent.blur(width);
    expect(width.value).toBe('30');
  });

  it('um campo de espaço por vão (1→2, 2→3), cada um editável independente', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);

    const gap12 = screen.getByLabelText('Espaço etiqueta 1→2 (mm)') as HTMLInputElement;
    const gap23 = screen.getByLabelText('Espaço etiqueta 2→3 (mm)') as HTMLInputElement;
    const rowGap = screen.getByLabelText('Distância p/ etiqueta de baixo (mm)') as HTMLInputElement;
    const edgeMargin = screen.getByLabelText('Margem da borda (mm)') as HTMLInputElement;

    expect(gap12.value).toBe('3');
    expect(gap23.value).toBe('3');
    expect(rowGap.value).toBe('0'); // DEFAULT_LABEL_CONFIG.rowGap
    expect(edgeMargin.value).toBe('2');

    // Pedido real do usuário: 1mm entre 1→2, 3mm entre 2→3 — cada campo
    // muda o vão dele sem afetar o outro.
    fireEvent.change(gap12, { target: { value: '1' } });
    fireEvent.blur(gap12);
    expect(gap12.value).toBe('1');
    expect(gap23.value).toBe('3'); // não mexeu

    fireEvent.change(rowGap, { target: { value: '4' } });
    fireEvent.blur(rowGap);
    expect(rowGap.value).toBe('4');
  });

  it('colunas por fileira aceita só inteiro (arredonda) e respeita o limite de 1 a 10', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const input = screen.getByLabelText('Colunas por fileira') as HTMLInputElement;
    expect(input.value).toBe('3');

    fireEvent.change(input, { target: { value: '4.7' } });
    fireEvent.blur(input);
    expect(input.value).toBe('5'); // 4.7 arredondado

    fireEvent.change(input, { target: { value: '99' } });
    expect(input.value).toBe('10'); // limitado ao máximo
  });

  it('aumentar colunas por fileira cria novos campos de vão (reusando o último valor)', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const columnsInput = screen.getByLabelText('Colunas por fileira') as HTMLInputElement;

    fireEvent.change(columnsInput, { target: { value: '4' } });

    // 4 colunas -> 3 vãos (1→2, 2→3, 3→4); o novo repete o último (3mm).
    expect((screen.getByLabelText('Espaço etiqueta 1→2 (mm)') as HTMLInputElement).value).toBe(
      '3',
    );
    expect((screen.getByLabelText('Espaço etiqueta 3→4 (mm)') as HTMLInputElement).value).toBe(
      '3',
    );
  });

  it('botão "Restaurar padrão" chama onReset', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const width = screen.getByLabelText('Largura da etiqueta (mm)') as HTMLInputElement;

    fireEvent.change(width, { target: { value: '40' } });
    fireEvent.blur(width);
    expect(width.value).toBe('40');

    fireEvent.click(screen.getByRole('button', { name: /Restaurar padrão/ }));
    expect(width.value).toBe('27'); // volta pro valor inicial passado ao Harness
  });

  it('diminuir colunas por fileira remove os campos de vão que sobraram', () => {
    render(<Harness initial={DEFAULT_LABEL_CONFIG} />);
    const columnsInput = screen.getByLabelText('Colunas por fileira') as HTMLInputElement;

    fireEvent.change(columnsInput, { target: { value: '2' } });

    expect(screen.getByLabelText('Espaço etiqueta 1→2 (mm)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Espaço etiqueta 2→3 (mm)')).not.toBeInTheDocument();
  });
});
