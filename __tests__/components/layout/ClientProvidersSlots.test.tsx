import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClientProviders from '@/src/components/ClientProviders';
import { useTheme } from '@/src/components/ThemeProvider';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock dynamic subcomponents to keep slot testing isolated and fast
vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

// Mock heavy overlay components
vi.mock('@/src/components/common/Analytics', () => ({
  default: () => <div data-testid="mock-analytics" />,
}));
vi.mock('@/src/components/common/CookieConsent', () => ({
  default: () => <div data-testid="mock-cookie-consent" />,
}));
vi.mock('@/src/components/ui/BackToTop', () => ({
  default: () => <div data-testid="mock-back-to-top" />,
}));
vi.mock('@/src/components/layout/MobileConversionDock', () => ({
  MobileConversionDock: () => <div data-testid="mock-conversion-dock" />,
}));

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

function ThemeConsumerChild() {
  const { theme } = useTheme();
  return <div data-testid="theme-consumer">Current theme: {theme}</div>;
}

describe('ClientProviders slot architecture', () => {
  it('renders children passed into slots without hardcoded Header/Footer', () => {
    render(
      <ClientProviders>
        <header data-testid="server-header">Server Header Slot</header>
        <nav data-testid="server-breadcrumbs">Server Breadcrumbs Slot</nav>
        <main data-testid="server-main" className="custom-main-slot">
          <h1>Main Content Slot</h1>
        </main>
        <footer data-testid="server-footer">Server Footer Slot</footer>
      </ClientProviders>
    );

    // Verify all slots render cleanly
    expect(screen.getByTestId('server-header')).toBeInTheDocument();
    expect(screen.getByTestId('server-breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('server-main')).toBeInTheDocument();
    expect(screen.getByTestId('server-footer')).toBeInTheDocument();

    // Verify text content
    expect(screen.getByText('Server Header Slot')).toBeInTheDocument();
    expect(screen.getByText('Main Content Slot')).toBeInTheDocument();
    expect(screen.getByText('Server Footer Slot')).toBeInTheDocument();
  });

  it('provides ThemeProvider context to slotted children', () => {
    render(
      <ClientProviders>
        <ThemeConsumerChild />
      </ClientProviders>
    );

    expect(screen.getByTestId('theme-consumer')).toBeInTheDocument();
    expect(screen.getByText(/Current theme:/i)).toBeInTheDocument();
  });

  it('preserves children order and does not inject redundant main wrapper', () => {
    const { container } = render(
      <ClientProviders>
        <div data-testid="slot-1">Header Slot</div>
        <main data-testid="slot-2">Main Slot</main>
        <div data-testid="slot-3">Footer Slot</div>
      </ClientProviders>
    );

    // Ensure only the explicitly passed main exists, not a wrapper main inside ClientProviders
    const mainElements = container.querySelectorAll('main');
    expect(mainElements).toHaveLength(1);
    expect(mainElements[0]).toHaveAttribute('data-testid', 'slot-2');
  });
});
