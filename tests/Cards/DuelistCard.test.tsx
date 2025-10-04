import { render } from '@testing-library/react';
import DuelistCard from '../../src/components/Cards/DuelistCard';
import { describe, it, expect } from 'vitest';

const mockProps = {
  userId: '6afb80a6-6092-4201-abc6-e2db81d7e85f',
  username: 'TestUser',
  points: 1000,
  wins: 10,
  losses: 5,
  winRate: 66.67,
  position: 1,
  borderColor: 'gold' as const,
  banListName: '2024-01',
  season: 'Spring',
  clickable: true,
};

describe('DuelistCard', () => {
  it('renders all duelist info and link', () => {
    const { getByText, getByAltText, container } = render(<DuelistCard {...mockProps} />);
    expect(getByText('#1 TestUser')).toBeTruthy();
    expect(getByText('Points: 1000')).toBeTruthy();
    expect(getByText('Wins: 10')).toBeTruthy();
    expect(getByText('Losses: 5')).toBeTruthy();
    expect(getByText('Win Rate: 66.67%')).toBeTruthy();
    expect(getByAltText('TestUser')).toBeTruthy();
    // Check link
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toContain('/duelists/6afb80a6-6092-4201-abc6-e2db81d7e85f/2024-01?username=TestUser&season=Spring');
  });
}); 