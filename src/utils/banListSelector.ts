/**
 * Ban list selector options.
 *
 * The API exposes `GET /ban-lists/grouped` as ordered sections: the Global
 * ladder first, then one section per format group (its name is itself a
 * selectable persistent ladder), then leftover individual lists. Every name —
 * section names and the strings inside `banLists` — is a valid `banListName`
 * for the leaderboard endpoint.
 *
 * The selector only lists formats: the Global ladder, every group ladder and
 * the individual ban lists that belong to no group. The ban lists of a group
 * are a detail of the selected format and are rendered as chips instead.
 */

export type BanListSectionType = 'global' | 'group' | 'banlist';

export interface BanListSection {
  name: string;
  type: BanListSectionType;
  banLists: string[];
}

export interface BanListSelectorOption {
  /** Selectable ladder name, a valid `banListName`. */
  value: string;
  /** Ban lists rotating under this format; empty when the ladder has none. */
  members: string[];
}

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
 * Turns grouped sections into selector entries: a `group` section becomes a
 * single format entry holding its member ban lists, every other section
 * becomes a memberless entry per name. Duplicated names are dropped; the
 * members of a group whose own name is not selectable become plain entries so
 * they stay reachable.
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

    const format = section.type === 'group' ? take(section.name) : null;
    const names = section.type === 'group' ? section.banLists : [section.name, ...section.banLists];
    const selectable = names.map(take).filter((name): name is string => name !== null);

    if (format !== null) {
      result.push({ value: format, members: selectable });
      continue;
    }

    for (const value of selectable) {
      result.push({ value, members: [] });
    }
  }

  return result;
};

/** Flat list of every selectable name, in render order — what `banlists` stores. */
export const flattenBanListSelectorOptions = (options: BanListSelectorOption[]): string[] =>
  options.flatMap((option) => [option.value, ...option.members]);

/** The entry a ban list belongs to, either as the format itself or as one of its members. */
export const findBanListSelectorOption = (
  options: BanListSelectorOption[],
  banList: string
): BanListSelectorOption | null =>
  options.find((option) => option.value === banList || option.members.includes(banList)) ?? null;

/** Selectable ban lists of a format, led by the format ladder itself; empty when it has no member. */
export const buildBanListChips = (option: BanListSelectorOption | null): string[] =>
  option === null || option.members.length === 0 ? [] : [option.value, ...option.members];

/** Selector entries for the flat `GET /ban-lists` fallback payload. */
export const buildFlatBanListSelectorOptions = (names: unknown): BanListSelectorOption[] => {
  if (!Array.isArray(names)) return [];
  const seen = new Set<string>();
  const result: BanListSelectorOption[] = [];
  for (const name of names) {
    if (!isSelectableName(name) || seen.has(name)) continue;
    seen.add(name);
    result.push({ value: name, members: [] });
  }
  return result;
};
