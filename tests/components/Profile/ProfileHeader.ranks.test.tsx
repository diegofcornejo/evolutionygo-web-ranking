import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileHeader from '@components/Profile/ProfileHeader';

const baseProps = {
  userId: '1',
  username: 'AceDuelist',
  points: 1200,
  wins: 18,
  losses: 12,
  winRate: 60,
  season: '5',
  banlistName: 'Global',
};

describe('ProfileHeader rank badges', () => {
  it('renders 2nd place badge', () => {
    const { getByText } = render(<ProfileHeader {...baseProps} position={2} />);
    expect(getByText('2nd Place')).toBeTruthy();
  });

  it('renders 3rd place badge', () => {
    const { getByText } = render(<ProfileHeader {...baseProps} position={3} />);
    expect(getByText('3rd Place')).toBeTruthy();
  });

  it('renders top 10 badge', () => {
    const { getByText } = render(<ProfileHeader {...baseProps} position={7} />);
    expect(getByText('Top 10')).toBeTruthy();
  });

  it('renders top 20 badge', () => {
    const { getByText } = render(<ProfileHeader {...baseProps} position={15} />);
    expect(getByText('Top 20')).toBeTruthy();
  });

  it('defaults to top 10 for zero position', () => {
    const { getByText } = render(<ProfileHeader {...baseProps} position={0} />);
    expect(getByText('Top 10')).toBeTruthy();
  });
});
