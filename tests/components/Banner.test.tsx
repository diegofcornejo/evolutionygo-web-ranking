import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Banner from '@components/Banner';

vi.mock('react-svg', () => ({
  ReactSVG: () => <span data-testid="react-svg" />,
}));

describe('Banner', () => {
  it('renders title, description, and button when provided', () => {
    const { getByText, getByRole } = render(
      <Banner
        id={1}
        image="/img/banner.webp"
        title="News Title"
        description="Latest update details"
        buttonText="Read more"
        buttonLink="/news"
      />
    );

    expect(getByText('News Title')).toBeTruthy();
    expect(getByText('Latest update details')).toBeTruthy();
    expect(getByRole('link', { name: /read more/i })).toBeTruthy();
  });

  it('omits button when missing link', () => {
    const { queryByRole } = render(
      <Banner
        id={2}
        image="/img/banner.webp"
        title="News Title"
        description="Latest update details"
        buttonText="Read more"
      />
    );

    expect(queryByRole('link', { name: /read more/i })).toBeNull();
  });
});
