import { describe, it, expect } from 'vitest';
import {
  buildBanListSelectorOptions,
  buildFlatBanListSelectorOptions,
  flattenBanListSelectorOptions,
  isBanListSectionList,
} from '@utils/banListSelector';
import type { BanListSection } from '@utils/banListSelector';

const groupedPayload: BanListSection[] = [
  { name: 'Global', type: 'global', banLists: [] },
  { name: 'TCG', type: 'group', banLists: ['2024.04 TCG', '2024.07 TCG'] },
  { name: 'OCG', type: 'group', banLists: ['2024.04 OCG'] },
  { name: 'Goat Format', type: 'banlist', banLists: [] },
];

describe('banListSelector', () => {
  describe('buildBanListSelectorOptions', () => {
    it('turns a group section into an optgroup led by the group name itself', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options).toContainEqual({
        kind: 'group',
        label: 'TCG',
        options: ['TCG', '2024.04 TCG', '2024.07 TCG'],
      });
      expect(options).toContainEqual({
        kind: 'group',
        label: 'OCG',
        options: ['OCG', '2024.04 OCG'],
      });
    });

    it('turns global and leftover banlist sections into plain options, Global first', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options[0]).toEqual({ kind: 'option', value: 'Global' });
      expect(options.at(-1)).toEqual({ kind: 'option', value: 'Goat Format' });
    });

    it('keeps the section order returned by the API', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options.map((option) => (option.kind === 'group' ? option.label : option.value))).toEqual([
        'Global',
        'TCG',
        'OCG',
        'Goat Format',
      ]);
    });

    it('emits every ban list of a banlist section as its own option', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Others', type: 'banlist', banLists: ['World Championship 2020', 'Edison'] },
      ]);

      expect(options).toEqual([
        { kind: 'option', value: 'Others' },
        { kind: 'option', value: 'World Championship 2020' },
        { kind: 'option', value: 'Edison' },
      ]);
    });

    it('drops duplicated names across sections, keeping the first occurrence', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: [] },
        { name: 'TCG', type: 'group', banLists: ['2024.04 TCG', 'Global', '2024.04 TCG'] },
        { name: 'TCG', type: 'banlist', banLists: [] },
      ]);

      expect(options).toEqual([
        { kind: 'option', value: 'Global' },
        { kind: 'group', label: 'TCG', options: ['TCG', '2024.04 TCG'] },
      ]);
    });

    it("excludes the 'N/A' ban list and empty names", () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: ['N/A', ''] },
        { name: 'TCG', type: 'group', banLists: ['N/A', '2024.04 TCG'] },
      ]);

      expect(options).toEqual([
        { kind: 'option', value: 'Global' },
        { kind: 'group', label: 'TCG', options: ['TCG', '2024.04 TCG'] },
      ]);
    });

    it('drops groups that end up with no selectable option', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: [] },
        { name: 'N/A', type: 'group', banLists: ['N/A'] },
        { name: 'Global', type: 'group', banLists: ['Global'] },
      ]);

      expect(options).toEqual([{ kind: 'option', value: 'Global' }]);
    });

    it('ignores malformed sections and returns an empty list for an empty payload', () => {
      expect(buildBanListSelectorOptions([])).toEqual([]);
      expect(
        buildBanListSelectorOptions([
          null as unknown as BanListSection,
          { name: 'Global' } as unknown as BanListSection,
          { name: 'TCG', type: 'group', banLists: ['2024.04 TCG'] },
        ])
      ).toEqual([{ kind: 'group', label: 'TCG', options: ['TCG', '2024.04 TCG'] }]);
    });
  });

  describe('flattenBanListSelectorOptions', () => {
    it('flattens group and plain options in render order', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(flattenBanListSelectorOptions(options)).toEqual([
        'Global',
        'TCG',
        '2024.04 TCG',
        '2024.07 TCG',
        'OCG',
        '2024.04 OCG',
        'Goat Format',
      ]);
    });

    it('returns an empty list when there are no options', () => {
      expect(flattenBanListSelectorOptions([])).toEqual([]);
    });
  });

  describe('isBanListSectionList', () => {
    it('accepts a valid section array', () => {
      expect(isBanListSectionList(groupedPayload)).toBe(true);
      expect(isBanListSectionList([])).toBe(true);
    });

    it('rejects the flat string[] payload of the fallback endpoint', () => {
      expect(isBanListSectionList(['Global', '2024.04 TCG'])).toBe(false);
    });

    it('rejects non-array payloads and sections without banLists', () => {
      expect(isBanListSectionList(null)).toBe(false);
      expect(isBanListSectionList(undefined)).toBe(false);
      expect(isBanListSectionList({ name: 'Global', type: 'global', banLists: [] })).toBe(false);
      expect(isBanListSectionList([{ name: 'Global', type: 'global' }])).toBe(false);
      expect(isBanListSectionList([{ banLists: [] }])).toBe(false);
    });
  });

  describe('buildFlatBanListSelectorOptions', () => {
    it('maps the flat fallback payload to plain options', () => {
      expect(buildFlatBanListSelectorOptions(['Global', '2024.04 TCG'])).toEqual([
        { kind: 'option', value: 'Global' },
        { kind: 'option', value: '2024.04 TCG' },
      ]);
    });

    it("drops duplicates, empty names and 'N/A'", () => {
      expect(
        buildFlatBanListSelectorOptions(['Global', 'N/A', '', 'Global', 2024, '2024.04 TCG'])
      ).toEqual([
        { kind: 'option', value: 'Global' },
        { kind: 'option', value: '2024.04 TCG' },
      ]);
    });

    it('returns an empty list for a non-array input', () => {
      expect(buildFlatBanListSelectorOptions(null)).toEqual([]);
      expect(buildFlatBanListSelectorOptions(undefined)).toEqual([]);
      expect(buildFlatBanListSelectorOptions({ banLists: ['Global'] })).toEqual([]);
      expect(buildFlatBanListSelectorOptions('Global')).toEqual([]);
    });
  });
});
