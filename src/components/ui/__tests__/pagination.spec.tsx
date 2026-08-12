import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Pagination } from '../pagination';

describe('Pagination', () => {
  const onPageChange = jest.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it('should return null if totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render all pages if totalPages is small', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);
    const button = screen.getByText('2');
    expect(button).toHaveClass('bg-[var(--lumilee-gold)]');
  });

  it('should call onPageChange when a page is clicked', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should disable "previous" on first page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  });

  it('should disable "next" on last page', () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByLabelText('Próxima página')).toBeDisabled();
  });

  it('should show dots for many pages', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
