import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookSearchForm } from './BookSearchForm';

describe('BookSearchForm', () => {
  const defaultProps = {
    onSearch: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all search fields', () => {
    render(<BookSearchForm {...defaultProps} />);

    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/min rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort order/i)).toBeInTheDocument();
  });

  it('renders with form title', () => {
    render(<BookSearchForm {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Search Books' })).toBeInTheDocument();
  });

  it('calls onSearch with form data when search button is clicked', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<BookSearchForm {...defaultProps} onSearch={onSearch} />);

    await user.type(screen.getByLabelText(/search/i), 'test search');

    await user.click(screen.getByRole('button', { name: /search books/i }));

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          search_query: 'test search',
        })
      );
    });
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();

    render(<BookSearchForm {...defaultProps} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isLoading is true', () => {
    render(<BookSearchForm {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: /searching.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset filters/i })).toBeDisabled();
  });
});
