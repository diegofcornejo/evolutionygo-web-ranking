import { fireEvent, render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ClanList from '@components/Tournaments/ClanList';

const clans = [
  {
    id: '1',
    name: 'Dragon Clan',
    registeredAt: '2024-01-10T08:00:00Z',
    members: [
      { id: '1', username: 'DragonMaster1' },
      { id: '2', username: 'DragonMaster2' },
    ],
  },
  {
    id: '2',
    name: 'Warrior Guild',
    registeredAt: '2024-01-10T09:15:00Z',
    members: [{ id: '3', username: 'Warrior1' }],
  },
];

describe('ClanList', () => {
  it('renders clans and members', () => {
    const { getByText } = render(<ClanList clans={clans} />);

    expect(getByText('Registered Clans (2)')).toBeTruthy();
    expect(getByText('Dragon Clan Members')).toBeTruthy();
    expect(getByText('DragonMaster1')).toBeTruthy();
  });

  it('switches selected clan on click', () => {
    const { getByText } = render(<ClanList clans={clans} />);

    fireEvent.click(getByText('Warrior Guild'));

    expect(getByText('Warrior Guild Members')).toBeTruthy();
    expect(getByText('Warrior1')).toBeTruthy();
  });
});
