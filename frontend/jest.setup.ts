import "@testing-library/jest-dom";

// Mock IntersectionObserver for components that might use it
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  takeRecords = jest.fn();
  root: Element | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];
  constructor() {}
}
global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver for components that might use it
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Set up fetch mock if needed
global.fetch = jest.fn();

// Mock console.error to prevent noisy test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("validateDOMNesting") ||
        args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Warning: An invalid form control"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("componentWillReceiveProps") ||
        args[0].includes("componentWillUpdate") ||
        args[0].includes("Warning: React.createElement"))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
