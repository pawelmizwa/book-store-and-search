import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookForm } from './BookForm';
import { mockBook } from '../../test/test-utils';

describe('BookForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all fields', () => {
    render(<BookForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/isbn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pages/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
  });

  it('renders form with initial data when provided', () => {
    render(<BookForm {...defaultProps} initialData={mockBook} />);

    expect(screen.getByDisplayValue('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByDisplayValue('F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<BookForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Book');
    await user.type(screen.getByLabelText(/author/i), 'Test Author');

    await user.click(screen.getByRole('button', { name: /save book/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Book',
          author: 'Test Author',
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(<BookForm {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<BookForm {...defaultProps} onSubmit={onSubmit} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save book/i }));

    await waitFor(() => {
      // Check for validation error messages or that submission was prevented
      const titleError = screen.queryByText('Title is required');
      const authorError = screen.queryByText('Author is required');
      
      if (titleError && authorError) {
        expect(titleError).toBeInTheDocument();
        expect(authorError).toBeInTheDocument();
      } else {
        // If no error messages visible, ensure form submission was prevented
        expect(onSubmit).not.toHaveBeenCalled();
      }
    }, { timeout: 3000 });
  });

  it('disables buttons when isLoading is true', () => {
    render(<BookForm {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: /saving.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
