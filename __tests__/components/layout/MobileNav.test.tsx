import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileNav } from '@/src/components/layout/MobileNav';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/src/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/src/stores/authStore', () => {
  const state = {
    userId: null,
    profile: null,
    isAdmin: false,
    loading: false,
    signOut: vi.fn(),
    initialize: vi.fn(),
  };
  return {
    useAuthStore: (selector?: (s: typeof state) => unknown) =>
      typeof selector === 'function' ? selector(state) : state,
  };
});

vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

vi.mock('@/src/components/ui/LanguageToggle', () => ({
  default: () => <div data-testid="language-toggle" />,
}));

vi.mock('@/src/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('MobileNav Portal and Overflow Prevention', () => {
  const defaultProps = {
    isOpen: false,
    isProjectsOpen: false,
    currentPath: '/',
    lotteryVisible: true,
    mounted: true,
    theme: 'dark' as const,
    onClose: vi.fn(),
    onToggle: vi.fn(),
    onToggleProjects: vi.fn(),
    onToggleTheme: vi.fn(),
  };

  it('renders hamburger button inside the component container', () => {
    const { container } = render(
      <div data-testid="header-container">
        <MobileNav {...defaultProps} />
      </div>
    );

    const button = container.querySelector('button[aria-label="openMenu"]');
    expect(button).toBeInTheDocument();
  });

  it('portals side drawer directly to document.body, avoiding ancestor transform trapping', () => {
    const { container } = render(
      <div data-testid="header-container">
        <MobileNav {...defaultProps} isOpen={false} />
      </div>
    );

    // The drawer should NOT be inside the header container
    const drawerInContainer = container.querySelector('#mobile-menu');
    expect(drawerInContainer).toBeNull();

    // The drawer SHOULD be inside document.body directly
    const drawerInBody = document.body.querySelector('#mobile-menu');
    expect(drawerInBody).toBeInTheDocument();
  });

  it('applies invisible and translate-x-full classes when closed to prevent horizontal overflow', () => {
    render(<MobileNav {...defaultProps} isOpen={false} />);

    const drawer = document.body.querySelector('#mobile-menu');
    expect(drawer).toHaveClass('invisible');
    expect(drawer).toHaveClass('translate-x-full');
    expect(drawer).not.toHaveClass('visible');
  });

  it('applies visible and translate-x-0 classes when open', () => {
    render(<MobileNav {...defaultProps} isOpen={true} />);

    const drawer = document.body.querySelector('#mobile-menu');
    expect(drawer).toHaveClass('visible');
    expect(drawer).toHaveClass('translate-x-0');
    expect(drawer).not.toHaveClass('invisible');
  });
});
