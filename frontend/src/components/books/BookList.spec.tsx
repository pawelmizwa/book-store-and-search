import React from 'react';
import { render, screen } from '@testing-library/react';
import { BookList } from './BookList';
import { mockBooksList } from '../../test/test-utils';

describe('BookList', () => {
  it('renders list of books', () => {
    render(<BookList books={mockBooksList} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
    expect(screen.getByText('1984')).toBeInTheDocument();
  });

  it('renders loading state with skeleton cards', () => {
    render(<BookList books={[]} isLoading={true} />);

    // Should render skeleton cards
    const skeletonCards = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('animate-pulse')
    );
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('renders empty state when no books and not loading', () => {
    render(<BookList books={[]} />);

    expect(screen.getByText('No books found')).toBeInTheDocument();
  });

});