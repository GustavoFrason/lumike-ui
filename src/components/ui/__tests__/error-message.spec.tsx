import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorMessage } from '../error-message';

describe('ErrorMessage', () => {
    it('should return null if no message is provided', () => {
        const { container } = render(<ErrorMessage message="" />);
        expect(container.firstChild).toBeNull();
    });

    it('should render the provided message', () => {
        render(<ErrorMessage message="Erro de teste" />);
        expect(screen.getByText('Erro de teste')).toBeInTheDocument();
    });

    it('should call onDismiss when close button is clicked', () => {
        const onDismiss = jest.fn();
        render(<ErrorMessage message="Erro dispensável" onDismiss={onDismiss} />);

        const closeButton = screen.getByLabelText('Fechar');
        fireEvent.click(closeButton);

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not render close button if onDismiss is not provided', () => {
        render(<ErrorMessage message="Erro fixo" />);
        expect(screen.queryByLabelText('Fechar')).not.toBeInTheDocument();
    });
});
