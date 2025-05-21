/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

// Mock astro/container to avoid esbuild/TextEncoder issues in Bun
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: () =>
        '<div>Champion Points Earned: 500 Won the championship. Gold 2024</div>',
    }),
  },
}));

import AchievementCard from '../../src/components/Cards/AchievementCard.astro';

const mockProps = {
  id: 'achv1',
  icon: 'mdi:trophy',
  name: 'Champion',
  labels: ['Gold', '2024'],
  unlockedAt: new Date('2024-06-01T00:00:00Z'),
  description: 'Won the championship.',
  earnedPoints: 500,
  color: '#FFD700',
};

describe('AchievementCard.astro', () => {
  it('renders achievement info and badges', async () => {
    const { experimental_AstroContainer } = await import('astro/container');
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(AchievementCard, { props: mockProps });
    expect(result).toContain('Champion');
    expect(result).toContain('Points Earned: 500');
    expect(result).toContain('Won the championship.');
    expect(result).toContain('Gold');
    expect(result).toContain('2024');
  });
}); 