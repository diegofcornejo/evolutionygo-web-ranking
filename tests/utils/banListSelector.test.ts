import { describe, it, expect } from 'vitest';
import {
  buildBanListChips,
  buildBanListSelectorOptions,
  buildFlatBanListSelectorOptions,
  findBanListSelectorOption,
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
    it('turns a group section into a single format option holding its member ban lists', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options).toContainEqual({ value: 'TCG', members: ['2024.04 TCG', '2024.07 TCG'] });
      expect(options).toContainEqual({ value: 'OCG', members: ['2024.04 OCG'] });
    });

    it('turns global and leftover banlist sections into options without members', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options[0]).toEqual({ value: 'Global', members: [] });
      expect(options.at(-1)).toEqual({ value: 'Goat Format', members: [] });
    });

    it('keeps the section order returned by the API', () => {
      const options = buildBanListSelectorOptions(groupedPayload);

      expect(options.map((option) => option.value)).toEqual(['Global', 'TCG', 'OCG', 'Goat Format']);
    });

    it('emits every ban list of a banlist section as its own selectable option', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Others', type: 'banlist', banLists: ['World Championship 2020', 'Edison'] },
      ]);

      expect(options).toEqual([
        { value: 'Others', members: [] },
        { value: 'World Championship 2020', members: [] },
        { value: 'Edison', members: [] },
      ]);
    });

    it('drops duplicated names across sections, keeping the first occurrence', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: [] },
        { name: 'TCG', type: 'group', banLists: ['2024.04 TCG', 'Global', '2024.04 TCG'] },
        { name: 'TCG', type: 'banlist', banLists: [] },
      ]);

      expect(options).toEqual([
        { value: 'Global', members: [] },
        { value: 'TCG', members: ['2024.04 TCG'] },
      ]);
    });

    it("excludes the 'N/A' ban list and empty names", () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: ['N/A', ''] },
        { name: 'TCG', type: 'group', banLists: ['N/A', '2024.04 TCG'] },
      ]);

      expect(options).toEqual([
        { value: 'Global', members: [] },
        { value: 'TCG', members: ['2024.04 TCG'] },
      ]);
    });

    it('keeps a group whose members are all excluded as a memberless format', () => {
      const options = buildBanListSelectorOptions([
        { name: 'TCG', type: 'group', banLists: ['N/A', ''] },
      ]);

      expect(options).toEqual([{ value: 'TCG', members: [] }]);
    });

    it('drops groups whose own name is not selectable, keeping their members as plain options', () => {
      const options = buildBanListSelectorOptions([
        { name: 'Global', type: 'global', banLists: [] },
        { name: 'N/A', type: 'group', banLists: ['N/A'] },
        { name: 'Global', type: 'group', banLists: ['2024.04 TCG'] },
      ]);

      expect(options).toEqual([
        { value: 'Global', members: [] },
        { value: '2024.04 TCG', members: [] },
      ]);
    });

    it('ignores malformed sections and returns an empty list for an empty payload', () => {
      expect(buildBanListSelectorOptions([])).toEqual([]);
      expect(
        buildBanListSelectorOptions([
          null as unknown as BanListSection,
          { name: 'Global' } as unknown as BanListSection,
          { name: 'TCG', type: 'group', banLists: ['2024.04 TCG'] },
        ])
      ).toEqual([{ value: 'TCG', members: ['2024.04 TCG'] }]);
    });
  });

  describe('flattenBanListSelectorOptions', () => {
    it('flattens formats and their members in render order', () => {
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

  describe('findBanListSelectorOption', () => {
    const options = buildBanListSelectorOptions(groupedPayload);

    it('finds the option selected by its own name', () => {
      expect(findBanListSelectorOption(options, 'OCG')).toEqual({ value: 'OCG', members: ['2024.04 OCG'] });
      expect(findBanListSelectorOption(options, 'Goat Format')).toEqual({ value: 'Goat Format', members: [] });
    });

    it('finds the format a member ban list belongs to', () => {
      expect(findBanListSelectorOption(options, '2024.07 TCG')).toEqual({
        value: 'TCG',
        members: ['2024.04 TCG', '2024.07 TCG'],
      });
    });

    it('returns null for an unknown ban list', () => {
      expect(findBanListSelectorOption(options, 'Unknown')).toBeNull();
      expect(findBanListSelectorOption([], 'TCG')).toBeNull();
    });
  });

  describe('buildBanListChips', () => {
    it('leads the member ban lists with the format ladder itself', () => {
      expect(buildBanListChips({ value: 'TCG', members: ['2024.04 TCG', '2024.07 TCG'] })).toEqual([
        'TCG',
        '2024.04 TCG',
        '2024.07 TCG',
      ]);
    });

    it('returns no chip for a format without members or for no selection', () => {
      expect(buildBanListChips({ value: 'Goat Format', members: [] })).toEqual([]);
      expect(buildBanListChips(null)).toEqual([]);
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
    it('maps the flat fallback payload to memberless options', () => {
      expect(buildFlatBanListSelectorOptions(['Global', '2024.04 TCG'])).toEqual([
        { value: 'Global', members: [] },
        { value: '2024.04 TCG', members: [] },
      ]);
    });

    it("drops duplicates, empty names and 'N/A'", () => {
      expect(
        buildFlatBanListSelectorOptions(['Global', 'N/A', '', 'Global', 2024, '2024.04 TCG'])
      ).toEqual([
        { value: 'Global', members: [] },
        { value: '2024.04 TCG', members: [] },
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
