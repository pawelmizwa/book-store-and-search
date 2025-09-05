import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Book } from '@book-store/shared';

// Custom render function that includes QueryClient provider
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Mock book data for testing
export const mockBook: Book = {
  book_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0-7432-7356-5',
  pages: 180,
  rating: 4.2,
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

export const mockBookWithoutOptionalFields: Book = {
  book_id: '456e7890-e12b-34d5-b678-901234567890',
  title: 'To Kill a Mockingbird',
  author: 'Harper Lee',
  created_at: '2024-01-10T08:15:00Z',
  updated_at: '2024-01-10T08:15:00Z',
};

export const mockBooksList: Book[] = [
  mockBook,
  mockBookWithoutOptionalFields,
  {
    book_id: '789e0123-e45f-67g8-h901-234567890123',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    pages: 328,
    rating: 4.8,
    created_at: '2024-01-05T14:45:00Z',
    updated_at: '2024-01-05T14:45:00Z',
  },
];

// Helper function to create form events
export const createMockFormEvent = (
  data: Record<string, any> = {}
): React.FormEvent<HTMLFormElement> => {
  const event = {
    preventDefault: jest.fn(),
    currentTarget: {
      elements: Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = { value };
        return acc;
      }, {} as any),
    },
  } as any;
  
  return event;
};

// Helper to wait for async operations
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
