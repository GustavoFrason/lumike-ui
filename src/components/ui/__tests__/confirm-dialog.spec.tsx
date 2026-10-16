import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfirmDialog, useConfirm, type ConfirmOptions } from '../confirm-dialog';
import { notify } from '../notify';
import { toast } from '../use-toast';

jest.mock('../use-toast', () => ({ toast: jest.fn() }));

/** Tela de teste: um botão que pede confirmação e mostra a resposta. */
function Harness({ options }: { options: ConfirmOptions }) {
  const { confirm, confirmDialog } = useConfirm();
  const [answer, setAnswer] = useState('-');
  return (
    <>
      <button onClick={async () => setAnswer(String(await confirm(options)))}>excluir</button>
      <span data-testid="answer">{answer}</span>
      {confirmDialog}
    </>
  );
}

async function open(options: ConfirmOptions = { title: 'Excluir este produto?' }) {
  render(<Harness options={options} />);
  fireEvent.click(screen.getByRole('button', { name: 'excluir' }));
  return screen.findByRole('alertdialog');
}

describe('useConfirm', () => {
  it('resolves true on confirm and closes the dialog', async () => {
    await open({ title: 'Excluir este produto?', confirmLabel: 'Excluir', destructive: true });

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Excluir' })));

    expect(screen.getByTestId('answer')).toHaveTextContent('true');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('resolves false on cancel', async () => {
    await open();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Cancelar' })));

    expect(screen.getByTestId('answer')).toHaveTextContent('false');
  });

  it('resolves false on Esc without reaching the page shortcuts', async () => {
    const pageShortcut = jest.fn();
    window.addEventListener('keydown', pageShortcut);
    await open();

    await act(async () => fireEvent.keyDown(window, { key: 'Escape' }));

    expect(screen.getByTestId('answer')).toHaveTextContent('false');
    expect(pageShortcut).not.toHaveBeenCalled();
    window.removeEventListener('keydown', pageShortcut);
  });

  it('shows the title, the description and focuses the confirm button', async () => {
    const dialog = await open({
      title: 'Salvar sem imagens?',
      description: 'Pode não aparecer no site.',
      confirmLabel: 'Salvar mesmo assim',
    });

    expect(dialog).toHaveAccessibleName('Salvar sem imagens?');
    expect(screen.getByText('Pode não aparecer no site.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar mesmo assim' })).toHaveFocus();
  });
});

describe('ConfirmDialog', () => {
  const base = { title: 'Confirmar Transferência', onConfirm: jest.fn(), onCancel: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('cancels on a click outside, not inside', () => {
    render(<ConfirmDialog {...base} />);

    fireEvent.click(screen.getByRole('alertdialog'));
    expect(base.onCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('alertdialog').parentElement!);
    expect(base.onCancel).toHaveBeenCalledTimes(1);
  });

  it('locks the buttons and Esc while loading', () => {
    render(<ConfirmDialog {...base} loading loadingLabel="Transferindo..." />);

    expect(screen.getByRole('button', { name: 'Transferindo...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(base.onCancel).not.toHaveBeenCalled();
  });

  it('renders free content between the header and the buttons', () => {
    render(
      <ConfirmDialog {...base}>
        <p>3 peças</p>
      </ConfirmDialog>,
    );

    expect(screen.getByText('3 peças')).toBeInTheDocument();
  });
});

describe('notify', () => {
  it('shows errors in the destructive variant', () => {
    notify.error('Estoque insuficiente');
    expect(toast).toHaveBeenCalledWith({ title: 'Estoque insuficiente', variant: 'destructive' });
  });

  it('shows success in the default variant', () => {
    notify.success('Alterações salvas');
    expect(toast).toHaveBeenCalledWith({ title: 'Alterações salvas' });
  });
});
