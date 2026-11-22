import type { PropsWithChildren } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

afterEach(() => {
  vi.unstubAllGlobals();
});

const reduceMotion = () =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );

const attachFakeSwiper = () => {
  const fake = { autoplay: { stop: vi.fn(), start: vi.fn() } };
  const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
  act(() => swiperProps.onSwiper(fake));
  return fake;
};

const news = [
  {
    id: 'season-8',
    image: 'https://example.com/season-8.webp',
    title: 'Season 8 starts December 1',
    description: 'A new season begins.',
    buttonLink: '#section-ranking',
    buttonText: 'See the rankings',
  },
  {
    id: 'edison-stable',
    image: 'https://example.com/edison-stable.webp',
    title: 'Edison is now stable',
    description: 'Edison leaves beta.',
    buttonLink: 'https://evoduel.com',
    buttonText: 'Play now',
  },
  {
    id: 'goat-beta',
    image: 'https://example.com/goat-beta.webp',
    title: 'Goat Format, in beta',
    description: 'The 2005 format arrives in beta.',
    buttonLink: 'https://evoduel.com',
    buttonText: 'Play now',
  },
];

const sharedAutoplayControls = (variant: 'full' | 'compact') => {
  it('pauses autoplay while keyboard focus is on a slide and resumes when it leaves', () => {
    render(<NewsSection news={news} variant={variant} />);
    const fake = attachFakeSwiper();
    const link = screen.getAllByRole('link')[0];

    fireEvent.focusIn(link);
    expect(fake.autoplay.stop).toHaveBeenCalledTimes(1);

    fireEvent.focusOut(link, { relatedTarget: null });
    expect(fake.autoplay.start).toHaveBeenCalledTimes(1);
  });

  it('offers a pause button that stops autoplay until it is pressed again', () => {
    render(<NewsSection news={news} variant={variant} />);
    const fake = attachFakeSwiper();

    fireEvent.click(screen.getByRole('button', { name: 'Pause news' }));
    expect(fake.autoplay.stop).toHaveBeenCalled();

    const link = screen.getAllByRole('link')[0];
    fireEvent.focusIn(link);
    fireEvent.focusOut(link, { relatedTarget: null });
    expect(fake.autoplay.start).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Play news' }));
    expect(fake.autoplay.start).toHaveBeenCalledTimes(1);
  });

  it('hides the pause button when reduced motion already stops autoplay', () => {
    reduceMotion();
    render(<NewsSection news={news} variant={variant} />);

    expect(screen.queryByRole('button', { name: 'Pause news' })).toBeNull();
  });

  it('draws inactive pagination dots with enough contrast', () => {
    render(<NewsSection news={news} variant={variant} />);
    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];

    expect(swiperProps.className).toContain('[&_.swiper-pagination-bullet]:bg-base-content/70');
    expect(swiperProps.className).not.toContain('bg-base-content/40');
  });

  it('marks its pagination styles important, since Swiper ships unlayered CSS that outranks Tailwind utilities', () => {
    render(<NewsSection news={news} variant={variant} />);
    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
    const paginationClasses = swiperProps.className.split(' ').filter((name: string) => name.includes('swiper-pagination'));

    expect(paginationClasses.length).toBeGreaterThan(0);
    paginationClasses.forEach((name: string) => expect(name.endsWith('!')).toBe(true));
  });
};

describe('NewsSection', () => {
  sharedAutoplayControls('full');

  it('renders one banner per news item it receives', () => {
    render(<NewsSection news={news} />);

    expect(screen.getAllByRole('article')).toHaveLength(news.length);
    news.forEach(({ title, image }) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: title })).toHaveAttribute('src', image);
    });
  });

  it('renders nothing when there is no news', () => {
    const { container } = render(<NewsSection news={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('configures discoverable, keyboard-friendly carousel controls', () => {
    render(<NewsSection news={news} />);

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
  sharedAutoplayControls('compact');

  it('loads the first image eagerly and the rest lazily', () => {
    const { container } = render(<NewsSection news={news} variant="compact" />);
    const images = [...container.querySelectorAll('img')];

    expect(images).toHaveLength(news.length);
    expect(images[0]).toHaveAttribute('loading', 'eager');
    images.slice(1).forEach((image) => expect(image).toHaveAttribute('loading', 'lazy'));
  });

  it('crops banners from the left, so the subject on their right stays whole', () => {
    const { container } = render(<NewsSection news={news} variant="compact" />);

    container.querySelectorAll('img').forEach((image) => {
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('object-right');
    });
  });

  it('lets each heading name its slide instead of repeating it in the image alt', () => {
    const { container } = render(<NewsSection news={news} variant="compact" />);

    container.querySelectorAll('img').forEach((image) => expect(image).toHaveAttribute('alt', ''));
  });

  it('is labelled once, by its visible heading', () => {
    render(<NewsSection news={news} variant="compact" />);
    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];

    expect(screen.getByRole('region', { name: 'Latest news' })).toHaveAttribute('aria-labelledby');
    expect(swiperProps['aria-label']).toBeUndefined();
  });

  it('renders every news item as a compact card', () => {
    render(<NewsSection news={news} variant="compact" />);

    expect(screen.getAllByRole('article')).toHaveLength(news.length);
    expect(screen.getByRole('heading', { name: 'Season 8 starts December 1' })).toBeInTheDocument();
  });

  it('renders nothing when there is no news', () => {
    const { container } = render(<NewsSection news={[]} variant="compact" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('links each slide through its title instead of a separate button', () => {
    render(<NewsSection news={news} variant="compact" />);

    expect(screen.getByRole('link', { name: 'Season 8 starts December 1' })).toHaveAttribute('href', '#section-ranking');
    expect(screen.getByRole('link', { name: 'Edison is now stable' })).toHaveAttribute('href', 'https://evoduel.com');
    expect(screen.queryByText('See the rankings')).toBeNull();
  });

  it('keeps the pagination strip from swallowing clicks on the slide', () => {
    render(<NewsSection news={news} variant="compact" />);
    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];

    expect(swiperProps.className).toContain('[&_.swiper-pagination]:pointer-events-none');
    expect(swiperProps.className).toContain('[&_.swiper-pagination-bullet]:pointer-events-auto');
  });

  it('fills its grid cell on desktop instead of sizing the row', () => {
    render(<NewsSection news={news} variant="compact" />);

    const card = screen.getByRole('region', { name: 'Latest news' });
    expect(card).toHaveClass('lg:absolute', 'lg:inset-0');
  });

  it('clamps descriptions so every slide keeps one height', () => {
    render(<NewsSection news={news} variant="compact" />);

    expect(screen.getByText(/A new season begins/)).toHaveClass('line-clamp-3');
  });

  it('uses its own arrow selectors', () => {
    render(<NewsSection news={news} variant="compact" />);

    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
    expect(swiperProps.navigation).toEqual({ nextEl: '.news-compact-next', prevEl: '.news-compact-prev' });
    expect(screen.getByRole('button', { name: 'Previous news item' })).toHaveClass('news-compact-prev');
    expect(screen.getByRole('button', { name: 'Next news item' })).toHaveClass('news-compact-next');
  });

  it('turns autoplay and transitions off for reduced motion', () => {
    reduceMotion();
    render(<NewsSection news={news} variant="compact" />);

    const swiperProps = swiperSpy.mock.calls.at(-1)?.[0];
    expect(swiperProps.autoplay).toBe(false);
    expect(swiperProps.speed).toBe(0);
  });
});
