import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { vi, beforeAll, afterAll } from 'vitest';

// Create a custom render function that includes providers
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <BrowserRouter>
          {children}
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Custom render with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };

// Mock helpers
export const mockNavigate = vi.fn();
export const mockUseAuth = (overrides = {}) => ({
  user: { id: 'test-user', email: 'test@example.com' },
  isLoading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
});

// Wait utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Async act helper
export async function actAsync(callback: () => Promise<void>) {
  await callback();
  await waitForLoadingToFinish();
}

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
    })),
  },
};

// Factory functions for test data
export const createMockJob = (overrides = {}) => ({
  id: 'job-1',
  order_number: 'ORD-001',
  client: 'Test Client',
  product: 'Test Product',
  quantity: 100,
  status: 'pending',
  priority: 'medium',
  technique_id: 'tech-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockMachine = (overrides = {}) => ({
  id: 'machine-1',
  name: 'Test Machine',
  code: 'MACH-001',
  technique_id: 'tech-1',
  is_active: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    role: 'admin',
  },
  ...overrides,
});

// Event helpers
export const fireChangeEvent = (element: HTMLElement, value: string) => {
  const event = new Event('change', { bubbles: true });
  Object.defineProperty(event, 'target', { value: { value } });
  element.dispatchEvent(event);
};

// Accessibility helpers
export const checkA11y = async (container: HTMLElement) => {
  // Basic accessibility checks
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt) {
      console.warn('Image without alt text:', img);
    }
  });

  const buttons = container.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent && !button.getAttribute('aria-label')) {
      console.warn('Button without accessible name:', button);
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach((input) => {
    const label = container.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label')) {
      console.warn('Input without label:', input);
    }
  });
};

// LocalStorage mock
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((key) => delete store[key]); }),
  };
};

// Timer utilities
export const advanceTimers = async (ms: number) => {
  vi.advanceTimersByTime(ms);
  await waitForLoadingToFinish();
};

// Console spy helpers
export const spyConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  beforeAll(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });

  return {
    error: console.error as ReturnType<typeof vi.fn>,
    warn: console.warn as ReturnType<typeof vi.fn>,
  };
};
