import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Banner from '@components/Banner';

describe('Banner', () => {
  it('renders an accessible news article with its image and CTA', () => {
    const { container } = render(
      <Banner
        id={1}
        image="/img/banner.webp"
        title="News Title"
        description="Latest update details"
        buttonText="Read more"
        buttonLink="/news"
      />
    );

    expect(screen.getByRole('article', { name: 'News Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'News Title' })).toBeInTheDocument();
    expect(screen.getByText('Latest update details')).toBeInTheDocument();
    const artwork = screen.getByRole('img', { name: 'News Title' });
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(artwork).toHaveAttribute('src', '/img/banner.webp');
    expect(artwork).toHaveClass('object-contain');
    expect(artwork).not.toHaveClass('object-cover');

    const mediaRegion = container.querySelector('[data-banner-media]');
    expect(mediaRegion).toHaveClass('aspect-[3/1]');
    expect(mediaRegion).toHaveClass('lg:absolute');

    const decorativeBackdrop = container.querySelector('img[aria-hidden="true"]');
    expect(decorativeBackdrop).toHaveAttribute('alt', '');
    expect(decorativeBackdrop).toHaveClass('object-cover');
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute('href', '/news');
  });

  it('omits the CTA when its destination is not provided', () => {
    render(
      <Banner
        id={2}
        image="/img/banner.webp"
        title="News Title"
        description="Latest update details"
        buttonText="Read more"
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
