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
