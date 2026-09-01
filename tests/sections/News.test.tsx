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
