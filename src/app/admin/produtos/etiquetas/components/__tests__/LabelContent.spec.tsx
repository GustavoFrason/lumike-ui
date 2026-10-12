import { render, screen } from '@testing-library/react';
import { LabelContent } from '../LabelContent';
import { DEFAULT_LABEL_CONFIG } from '../types';
import type { Product } from '@/lib/services/products.service';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 7,
  sku: '7',
  name: 'Anel',
  short_description: '',
  price: 30,
  purchase_date: '2026-01-01',
  current_stock: 1,
  min_stock: 0,
  is_active: true,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  ...overrides,
});

describe('LabelContent — texto da etiqueta', () => {
  it('mostra o texto do produto quando a opção está ligada', () => {
    render(
      <LabelContent
        product={product({ label_text: 'LINHA PRATA' })}
        config={DEFAULT_LABEL_CONFIG}
      />,
    );

    expect(screen.getByTestId('label-text')).toHaveTextContent('LINHA PRATA');
  });

  it('corta em 24 caracteres', () => {
    render(
      <LabelContent
        product={product({ label_text: 'x'.repeat(30) })}
        config={DEFAULT_LABEL_CONFIG}
      />,
    );

    expect(screen.getByTestId('label-text').textContent).toHaveLength(24);
  });

  it('não mostra nada sem texto ou com a opção desligada', () => {
    const { rerender } = render(<LabelContent product={product()} config={DEFAULT_LABEL_CONFIG} />);
    expect(screen.queryByTestId('label-text')).toBeNull();

    rerender(
      <LabelContent
        product={product({ label_text: 'ARO 16' })}
        config={{ ...DEFAULT_LABEL_CONFIG, showLabelText: false }}
      />,
    );
    expect(screen.queryByTestId('label-text')).toBeNull();
  });
});
