import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DuelistRating } from '@types';
import RankCard from '@components/Profile/RankCard';
import { parseTierLadder } from '@utils/tier';

const ladder = parseTierLadder({
  tiers: [
    { id: 'rookie', name: 'Rookie', order: 0, kind: 'placement', threshold: null, minGames: 5, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'bronze', name: 'Bronze', order: 1, kind: 'absolute', threshold: null, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'silver', name: 'Silver', order: 2, kind: 'absolute', threshold: 3, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'gold', name: 'Gold', order: 3, kind: 'absolute', threshold: 10, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'platinum', name: 'Platinum', order: 4, kind: 'absolute', threshold: 25, minGames: null, distinctOpponentWins: 5, requiresTier: null, size: null },
    { id: 'diamond', name: 'Diamond', order: 5, kind: 'absolute', threshold: 40, minGames: null, distinctOpponentWins: 5, requiresTier: null, size: null },
    { id: 'master', name: 'Master', order: 6, kind: 'relative', threshold: null, minGames: 20, distinctOpponentWins: null, requiresTier: 'platinum', size: 5 },
  ],
});

const goldRating: DuelistRating = {
  banListName: '2026.10 TCG',
  rankType: 'banlist',
  rating: 1074,
  peak: 1085,
  tier: {
    id: 'gold',
    name: 'Gold',
    effectivePoints: 17,
    progress: { nextTierId: 'platinum', unit: 'points', current: 17, target: 25, distinctOpponentWins: { current: 24, required: 5 } },
  },
};

const masterRating: DuelistRating = {
  banListName: 'TCG',
  rankType: 'group',
  rating: 1129,
  peak: 1193,
  tier: { id: 'master', name: 'Master', progress: null },
};

const base = { ladder, season: '7', userId: 'u1', username: 'K R O N N O', others: [] as DuelistRating[] };

describe('RankCard', () => {
  it('shows the tier, Elo and rank points progress', () => {
    render(<RankCard {...base} rating={goldRating} banListName="2026.10 TCG" />);

    const card = screen.getByRole('region', { name: 'Rank' });
    expect(within(card).getByRole('heading', { name: 'Gold' })).toBeInTheDocument();
    expect(within(card).getByText('Season 7 · 2026.10 TCG')).toBeInTheDocument();
    expect(within(card).getByText('Elo 1074 · Peak 1085')).toBeInTheDocument();
    expect(within(card).getByText('17 / 25')).toBeInTheDocument();
    expect(within(card).getByText('8 more to Platinum')).toBeInTheDocument();
    expect(within(card).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '68');
    const requirement = within(card).getByText('Wins vs 5 different opponents (24)');
    expect(requirement.closest('[data-met]')).toHaveAttribute('data-met', 'true');
  });

  it('labels rank points with the note', () => {
    render(<RankCard {...base} rating={goldRating} banListName="2026.10 TCG" />);

    expect(screen.getByText('Rank pts')).toHaveAttribute(
      'title',
      'Rank points decide your rank and are counted separately from ladder points.'
    );
  });

  it('shows placement games for rookie', () => {
    const rookie: DuelistRating = {
      banListName: 'MD',
      tier: { id: 'rookie', name: 'Rookie', progress: { nextTierId: 'bronze', unit: 'games', current: 3, target: 5, distinctOpponentWins: null } },
    };
    render(<RankCard {...base} rating={rookie} banListName="MD" />);

    expect(screen.getByText('Placement 3 / 5 games')).toBeInTheDocument();
    expect(screen.getByText('2 more to Bronze')).toBeInTheDocument();
    expect(screen.queryByText('Rank pts')).toBeNull();
  });

  it('shows top N for master without a bar', () => {
    render(<RankCard {...base} rating={masterRating} banListName="TCG" />);

    expect(screen.getByText('Top 5 of the ladder')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('describes the step from diamond to master', () => {
    const diamond: DuelistRating = { banListName: 'TCG', tier: { id: 'diamond', name: 'Diamond', progress: null } };
    render(<RankCard {...base} rating={diamond} banListName="TCG" />);

    expect(screen.getByText('Next: Master · top 5 with 20+ games')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows the ladder with the current tier', () => {
    render(<RankCard {...base} rating={goldRating} banListName="2026.10 TCG" />);

    const steps = within(screen.getByRole('list', { name: 'Rank ladder' })).getAllByRole('listitem');
    expect(steps.map((step) => step.getAttribute('data-state'))).toEqual(['done', 'done', 'done', 'current', 'locked', 'locked', 'locked']);
    expect(steps[3]).toHaveAttribute('aria-current', 'step');
    expect(steps[4]).toHaveTextContent('Platinum25');
    expect(steps[6]).toHaveTextContent('MasterTop 5');
  });

  it('keeps only the current step name visible on small screens', () => {
    render(<RankCard {...base} rating={goldRating} banListName="2026.10 TCG" />);

    const steps = within(screen.getByRole('list', { name: 'Rank ladder' })).getAllByRole('listitem');
    expect(within(steps[3]).getByText('Gold')).not.toHaveClass('max-sm:sr-only');
    expect(within(steps[4]).getByText('Platinum')).toHaveClass('max-sm:sr-only');
  });

  it('hides the ladder without a catalog', () => {
    render(<RankCard {...base} ladder={null} rating={goldRating} banListName="2026.10 TCG" />);

    expect(screen.queryByRole('list', { name: 'Rank ladder' })).toBeNull();
    expect(screen.getByText('8 more to Platinum')).toBeInTheDocument();
  });

  it('links the other ranked formats', () => {
    render(<RankCard {...base} rating={goldRating} others={[masterRating]} banListName="2026.10 TCG" />);

    const link = screen.getByRole('link', { name: /TCG/ });
    expect(link).toHaveAttribute('href', '/duelists/u1/TCG?username=K%20R%20O%20N%20N%20O&season=7');
    expect(within(link).getByText('Master')).toBeInTheDocument();
    expect(screen.getByText('Also ranked in')).toBeInTheDocument();
  });

  it('shows only the other formats on a profile without a tier', () => {
    render(<RankCard {...base} rating={null} others={[masterRating]} banListName="Global" />);

    expect(screen.getByText('Also ranked in')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('renders nothing without tiers', () => {
    const { container } = render(<RankCard {...base} rating={null} banListName="Global" />);
    expect(container).toBeEmptyDOMElement();

    const untiered: DuelistRating = { banListName: 'OCG', tier: null };
    const { container: second } = render(<RankCard {...base} rating={untiered} banListName="OCG" />);
    expect(second).toBeEmptyDOMElement();
  });
});
