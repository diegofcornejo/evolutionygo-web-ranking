import type { PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NewsSection from '@sections/News';

const swiperSpy = vi.hoisted(() => vi.fn());

vi.mock('swiper/react', () => ({
  Swiper: (props: PropsWithChildren<Record<string, unknown>>) => {
    swiperSpy(props);
    return <div>{props.children}</div>;
  },
  SwiperSlide: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

vi.mock('swiper/modules', () => ({
  A11y: 'A11y',
  Autoplay: 'Autoplay',
  Keyboard: 'Keyboard',
  Navigation: 'Navigation',
  Pagination: 'Pagination',
}));

describe('NewsSection', () => {
  it('renders all five current news visuals', () => {
    render(<NewsSection />);

    const expectedNews = [
      ['Season 7 is live', '/banners/news-season-7.webp'],
      ['Your rating now knows who you beat', '/banners/news-season-7-dragon.webp'],
      ['EvoDuel 1.0.0 is here', '/banners/news-season-7-winged.webp'],
      ['Edison, exactly as it was', '/banners/news-edison.webp'],
      ['Rush Duel, now in beta', '/banners/news-rush.webp'],
    ];

    expect(screen.getAllByRole('article')).toHaveLength(5);
    expectedNews.forEach(([title, src]) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: title })).toHaveAttribute('src', src);
    });
  });

  it('configures discoverable, keyboard-friendly carousel controls', () => {
    render(<NewsSection />);

    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];

    expect(swiperProps).toMatchObject({
      loop: true,
      grabCursor: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: '.news-swiper-next',
        prevEl: '.news-swiper-prev',
      },
    });
    expect(swiperProps.modules).toEqual(
      expect.arrayContaining(['A11y', 'Autoplay', 'Keyboard', 'Navigation', 'Pagination'])
    );
    const previousButton = screen.getByRole('button', { name: 'Previous news item' });
    expect(previousButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next news item' })).toBeInTheDocument();
    expect(previousButton.parentElement).toHaveClass('top-[calc(16.6667vw-0.3333rem)]');
    expect(previousButton.parentElement).toHaveClass('lg:top-1/2');
  });
});

describe('NewsSection compact variant', () => {
  it('renders all five news items as compact cards', () => {
    render(<NewsSection variant="compact" />);

    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Season 7 is live' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start climbing/ })).toHaveAttribute('href', '#section-ranking');
  });

  it('fills its grid cell on desktop instead of sizing the row', () => {
    render(<NewsSection variant="compact" />);

    const card = screen.getByRole('region', { name: 'Latest news' });
    expect(card).toHaveClass('lg:absolute', 'lg:inset-0');
  });

  it('clamps descriptions so every slide keeps one height', () => {
    render(<NewsSection variant="compact" />);

    expect(screen.getByText(/A new season begins/)).toHaveClass('line-clamp-3');
  });

  it('uses its own arrow selectors', () => {
    render(<NewsSection variant="compact" />);

    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
    expect(swiperProps.navigation).toEqual({ nextEl: '.news-compact-next', prevEl: '.news-compact-prev' });
    expect(screen.getByRole('button', { name: 'Previous news item' })).toHaveClass('news-compact-prev');
    expect(screen.getByRole('button', { name: 'Next news item' })).toHaveClass('news-compact-next');
  });

  it('turns autoplay and transitions off for reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    );
    render(<NewsSection variant="compact" />);

    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
    expect(swiperProps.autoplay).toBe(false);
    expect(swiperProps.speed).toBe(0);
    vi.unstubAllGlobals();
  });
});
