import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookCard } from './BookCard';
import { mockBook, mockBookWithoutOptionalFields } from '../../test/test-utils';

describe('BookCard', () => {
  it('renders book with all fields', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByText('ISBN: 978-0-7432-7356-5')).toBeInTheDocument();
    expect(screen.getByText('180 pages')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('renders book without optional fields', () => {
    render(<BookCard book={mockBookWithoutOptionalFields} />);

    expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
    expect(screen.getByText('by Harper Lee')).toBeInTheDocument();
    expect(screen.queryByText(/ISBN:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pages/)).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    
    render(<BookCard book={mockBook} onEdit={onEdit} />);

    await user.click(screen.getByLabelText(/edit book/i));

    expect(onEdit).toHaveBeenCalledWith(mockBook);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    
    render(<BookCard book={mockBook} onDelete={onDelete} />);

    await user.click(screen.getByLabelText(/delete book/i));

    expect(onDelete).toHaveBeenCalledWith(mockBook.book_id);
  });
});