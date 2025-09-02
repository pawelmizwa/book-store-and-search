import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookList } from './BookList';
import { mockBooksList, mockBook } from '../../test/test-utils';

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

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    
    render(<BookList books={mockBooksList} onEdit={onEdit} />);

    const editButtons = screen.getAllByLabelText(/edit book/i);
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockBooksList[0]);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    
    render(<BookList books={mockBooksList} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByLabelText(/delete book/i);
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockBooksList[0].book_id);
  });
});