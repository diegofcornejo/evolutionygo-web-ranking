// Format selector art (v2) from the evolution-cosmetics repository (ui/formats), copied to public/formats.
// The format comes from the ladder name: the group itself ("TCG") or a dated list ("2026.10 TCG").
const FORMATS = ['tcg', 'ocg', 'edison', 'genesys', 'jtp'] as const;
const FORMAT_WORD = new RegExp(`\\b(${FORMATS.join('|')})\\b`, 'i');

export type FormatArt = { format: (typeof FORMATS)[number]; src: string; srcSet: string };

export const formatArt = (banListName: string): FormatArt | null => {
	const match = FORMAT_WORD.exec(banListName);
	if (!match) return null;
	const format = match[1].toLowerCase() as FormatArt['format'];
	const at = (size: number) => `/formats/${format}-${size}.webp`;
	return { format, src: at(64), srcSet: `${at(64)} 1x, ${at(128)} 2x` };
};
