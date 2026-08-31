/**
 * Ban list selector options.
 *
 * The API exposes `GET /ban-lists/grouped` as ordered sections: the Global
 * ladder first, then one section per format group (its name is itself a
 * selectable persistent ladder), then leftover individual lists. Every name —
 * section names and the strings inside `banLists` — is a valid `banListName`
 * for the leaderboard endpoint.
 */

export type BanListSectionType = 'global' | 'group' | 'banlist';

export interface BanListSection {
  name: string;
  type: BanListSectionType;
  banLists: string[];
}

export type BanListSelectorOption =
  | { kind: 'option'; value: string }
  | { kind: 'group'; label: string; options: string[] };

const EXCLUDED_BAN_LIST = 'N/A';

const isSelectableName = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value !== EXCLUDED_BAN_LIST;

const isBanListSection = (value: unknown): value is BanListSection => {
  if (typeof value !== 'object' || value === null) return false;
  const section = value as Partial<BanListSection>;
  return typeof section.name === 'string' && Array.isArray(section.banLists);
};

/** True when the payload has the shape returned by `GET /ban-lists/grouped`. */
export const isBanListSectionList = (value: unknown): value is BanListSection[] =>
  Array.isArray(value) && value.every(isBanListSection);

/**
 * Turns grouped sections into selector entries: `group` sections become an
 * optgroup led by the group ladder itself, every other section becomes a plain
 * option. Empty groups and duplicated names are dropped.
 */
export const buildBanListSelectorOptions = (sections: BanListSection[]): BanListSelectorOption[] => {
  const seen = new Set<string>();
  const take = (name: unknown): string | null => {
    if (!isSelectableName(name) || seen.has(name)) return null;
    seen.add(name);
    return name;
  };

  const result: BanListSelectorOption[] = [];

  for (const section of sections) {
    if (!isBanListSection(section)) continue;

    if (section.type === 'group') {
      const options = [section.name, ...section.banLists]
        .map(take)
        .filter((name): name is string => name !== null);
      if (options.length > 0) {
        result.push({ kind: 'group', label: section.name, options });
      }
      continue;
    }

    for (const name of [section.name, ...section.banLists]) {
      const value = take(name);
      if (value !== null) result.push({ kind: 'option', value });
    }
  }

  return result;
};

/** Flat list of every selectable name, in render order — what `banlists` stores. */
export const flattenBanListSelectorOptions = (options: BanListSelectorOption[]): string[] =>
  options.flatMap((option) => (option.kind === 'group' ? option.options : [option.value]));

/** Selector entries for the flat `GET /ban-lists` fallback payload. */
export const buildFlatBanListSelectorOptions = (names: unknown): BanListSelectorOption[] => {
  if (!Array.isArray(names)) return [];
  const seen = new Set<string>();
  const result: BanListSelectorOption[] = [];
  for (const name of names) {
    if (!isSelectableName(name) || seen.has(name)) continue;
    seen.add(name);
    result.push({ kind: 'option', value: name });
  }
  return result;
};
