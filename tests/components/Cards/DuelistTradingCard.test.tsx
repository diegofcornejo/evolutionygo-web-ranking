import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Duelist } from '@types';
import DuelistTradingCard from '@components/Cards/DuelistTradingCard';

const fuku: Duelist = {
  userId: 'u1',
  username: 'Fuku',
  points: 212,
  wins: 210,
  losses: 85,
  winRate: 71.19,
  position: 1,
  rating: 1154,
  provisional: false,
  tier: { id: 'master', name: 'Master' },
};

const reduceMotion = () =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );

const sizeCard = (card: HTMLElement) =>
  vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, width: 200, height: 300, right: 200, bottom: 300, x: 0, y: 0, toJSON: () => ({}),
  } as DOMRect);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DuelistTradingCard', () => {
  it('renders a ladder card', () => {
    render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />);

    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('href', '/duelists/u1/TCG?username=Fuku&season=7');
    expect(card).toHaveAttribute('data-place', '1');
    expect(screen.getByLabelText('Level 7')).toBeInTheDocument();
    expect(screen.getByText('[Duelist / Master]')).toBeInTheDocument();
    expect(screen.getByText('210 wins · 85 losses · 71.2% win rate')).toBeInTheDocument();
    expect(screen.getByText('PTS/212')).toBeInTheDocument();
    expect(screen.getByText('ELO/1154')).toBeInTheDocument();
  });

  it('marks a provisional Elo and shows a dash when there is none', () => {
    const { unmount } = render(
      <DuelistTradingCard {...fuku} provisional banListName="TCG" season="7" place={2} showElo />
    );
    expect(screen.getByTitle('Provisional Elo — not enough duels yet')).toBeInTheDocument();
    unmount();

    render(<DuelistTradingCard {...fuku} rating={null} banListName="TCG" season="7" place={2} showElo />);
    expect(screen.getByText('ELO/—')).toBeInTheDocument();
  });

  it('encodes the username and ban list in its link', () => {
    render(<DuelistTradingCard {...fuku} username="A+B C" banListName="2026.10 TCG" season="7" place={1} showElo />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/duelists/u1/2026.10%20TCG?username=A%2BB%20C&season=7');
  });

  it('shows the tier emblem in the name bar', () => {
    const { container } = render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} showElo />);

    const emblem = container.querySelector('[data-tier-emblem="master"]')!;
    expect(emblem).not.toBeNull();
    expect(emblem).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('★', { selector: 'span[aria-hidden="true"]' })).toBeNull();
  });

  it('keeps the star without a tier', () => {
    const { container } = render(<DuelistTradingCard {...fuku} tier={null} banListName="Global" season="7" place={1} showElo={false} />);

    expect(container.querySelector('[data-tier-emblem]')).toBeNull();
    expect(screen.getByText('★', { selector: 'span[aria-hidden="true"]' })).toBeInTheDocument();
  });

  it('renders a Global card with win rate instead of Elo', () => {
    render(
      <DuelistTradingCard {...fuku} tier={null} winRate={71.3} banListName="Global" season="7" place={2} showElo={false} />
    );

    expect(screen.getByText('[Duelist]')).toBeInTheDocument();
    expect(screen.getByLabelText('Level 3')).toBeInTheDocument();
    expect(screen.getByText('WIN%/71%')).toBeInTheDocument();
    expect(screen.queryByText(/ELO\//)).toBeNull();
  });

  it('shows WIN%/— and level 1 for a null win rate', () => {
    render(
      <DuelistTradingCard {...fuku} tier={null} winRate={null} wins={0} losses={0} banListName="Global" season="7" place={3} showElo={false} />
    );

    expect(screen.getByText('WIN%/—')).toBeInTheDocument();
    expect(screen.getByLabelText('Level 1')).toBeInTheDocument();
  });

  it('builds the art initials from names that contain spaces', () => {
    const { container } = render(
      <DuelistTradingCard {...fuku} username="K R O N N O" banListName="TCG" season="7" place={3} showElo />
    );

    expect(container.querySelector('[data-initials]')).toHaveTextContent('KR');
  });

  it('keeps narrow cards readable: the bottom line wraps and the art keeps a floor', () => {
    const { container } = render(
      <DuelistTradingCard {...fuku} provisional banListName="TCG" season="7" place={3} showElo />
    );

    expect(screen.getByText('PTS/212').parentElement).toHaveClass('flex-wrap');
    expect(container.querySelector('[data-initials]')!.parentElement).toHaveClass('min-h-12');
    // The frame is a grid so its content's minimum height grows the card instead of spilling out.
    expect(screen.getByRole('link')).toHaveClass('grid', 'grid-cols-1');
  });

  it('renders the weekly variant', () => {
    render(
      <DuelistTradingCard
        {...fuku}
        tier={null}
        points={27}
        wins={19}
        losses={5}
        winRate={79.17}
        banListName="Global"
        season="7"
        place={1}
        showElo={false}
        weekly={{ from: '2026-11-09T00:00:00.000Z', to: '2026-11-15T00:00:00.000Z' }}
      />
    );

    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('data-weekly');
    expect(card).toHaveAttribute('href', '/duelists/u1/Global?username=Fuku&season=7');
    expect(screen.getByText('DUELIST OF THE WEEK')).toBeInTheDocument();
    expect(screen.getByText('[Nov 9 – Nov 15]')).toBeInTheDocument();
    expect(screen.getByText('PTS/27')).toBeInTheDocument();
    expect(screen.queryByText(/WIN%\//)).toBeNull();
    expect(screen.queryByLabelText(/^Rank /)).toBeNull();
  });

  it('truncates a long name and keeps it in the title', () => {
    render(
      <DuelistTradingCard {...fuku} username="AVeryLongDuelistName (You)" banListName="TCG" season="7" place={3} showElo />
    );

    const name = screen.getByTitle('AVeryLongDuelistName (You)');
    expect(name).toHaveTextContent('AVeryLongDuelistName (You)');
    expect(name).toHaveClass('truncate');
  });

  it('animates the foil only on the featured card', () => {
    const { container, unmount } = render(
      <DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />
    );
    expect(container.querySelector('[data-foil-animated]')).not.toBeNull();
    unmount();

    const second = render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={2} showElo />);
    expect(second.container.querySelector('[data-foil]')).not.toBeNull();
    expect(second.container.querySelector('[data-foil-animated]')).toBeNull();
  });

  it('turns tilt and foil animation off for reduced motion', () => {
    reduceMotion();
    const { container } = render(
      <DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />
    );

    expect(screen.getByRole('link')).toHaveAttribute('data-tilt', 'off');
    expect(container.querySelector('[data-foil-animated]')).toBeNull();
  });

  it('tilts with a mouse pointer and resets when the pointer leaves', () => {
    render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />);
    const card = screen.getByRole('link');
    sizeCard(card);

    fireEvent.pointerMove(card, { pointerType: 'mouse', clientX: 200, clientY: 0 });
    expect(card.style.getPropertyValue('--tilt-y')).not.toBe('0deg');
    expect(card.style.getPropertyValue('--tilt-y')).not.toBe('');

    fireEvent.pointerLeave(card, { pointerType: 'mouse' });
    expect(card.style.getPropertyValue('--tilt-x')).toBe('0deg');
    expect(card.style.getPropertyValue('--tilt-y')).toBe('0deg');
  });

  it('ignores touch pointers', () => {
    render(<DuelistTradingCard {...fuku} banListName="TCG" season="7" place={1} featured showElo />);
    const card = screen.getByRole('link');
    sizeCard(card);

    fireEvent.pointerMove(card, { pointerType: 'touch', clientX: 200, clientY: 0 });
    expect(['', '0deg']).toContain(card.style.getPropertyValue('--tilt-y'));
  });
});
