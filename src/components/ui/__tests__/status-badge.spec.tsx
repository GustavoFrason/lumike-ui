import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
    it('should render correct label for "active" status', () => {
        render(<StatusBadge status="active" />);
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('should render correct label for boolean true (active)', () => {
        render(<StatusBadge status={true} />);
        expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('should render correct label for boolean false (inactive)', () => {
        render(<StatusBadge status={false} />);
        expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should use custom label if provided', () => {
        render(<StatusBadge status="completed" label="Sucedido" />);
        expect(screen.getByText('Sucedido')).toBeInTheDocument();
    });

    it('should apply correct color classes for "cancelled"', () => {
        const { container } = render(<StatusBadge status="cancelled" />);
        const span = container.firstChild as HTMLElement;
        expect(span).toHaveClass('bg-red-100');
        expect(span).toHaveClass('text-red-700');
    });
});
