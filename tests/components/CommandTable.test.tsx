import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommandTable from '@components/CommandTable';

vi.mock('@stores/banlistsStore', () => ({
  banlists: {
    get: vi.fn(() => [] as string[]),
    subscribe: vi.fn(() => () => {}),
  },
}));

vi.mock('@nanostores/react', () => ({
  useStore: (store: { get: () => string[] }) => store.get(),
}));

const getBanlistsStore = async () => await import('@stores/banlistsStore') as {
  banlists: {
    get: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
  };
};

describe('CommandTable', () => {
  it('renders command list with current banlists', async () => {
    const { banlists } = await getBanlistsStore();
    banlists.get.mockReset();
    banlists.get.mockReturnValue(['2024.7 TCG', '2024.6 OCG']);

    const { getByText, getAllByText } = render(<CommandTable />);

    expect(getByText('Special Commands')).toBeTruthy();
    expect(getByText('TCG')).toBeTruthy();
    expect(getByText('OCG')).toBeTruthy();
    expect(getAllByText('2024.7 TCG').length).toBeGreaterThan(0);
    expect(getAllByText('2024.6 OCG').length).toBeGreaterThan(0);
  });

  it('falls back when no matching banlist', async () => {
    const { banlists } = await getBanlistsStore();
    banlists.get.mockReset();
    banlists.get.mockReturnValue(['2024.7 OCG']);

    const { getByText, queryByText } = render(<CommandTable />);

    expect(getByText('Special Commands')).toBeTruthy();
    expect(queryByText('2024.7 TCG')).toBeNull();
  });

  it('uses latest banlist by year/month', async () => {
    const { banlists } = await getBanlistsStore();
    banlists.get.mockReset();
    banlists.get.mockReturnValue(['2023.1 TCG', '2024.12 TCG', '2024.2 TCG']);

    const { getAllByText } = render(<CommandTable />);

    expect(getAllByText('2024.12 TCG').length).toBeGreaterThan(0);
  });
});
