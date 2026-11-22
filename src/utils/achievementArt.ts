// Badges from the evolution-cosmetics repository (ui/achievements), copied to public/achievements.
// Folders are named after the catalog code in lower case with ':' as '_'. Codes without approved
// art (the lightning trials, new formats) keep the emoji the API sends.
const WITH_ART = new Set([
	'first_win',
	'wins_10',
	'wins_50',
	'wins_100',
	'streak_3',
	'streak_5',
	'streak_10',
	'matches_100',
	'format_first_win_tcg',
	'format_first_win_ocg',
	'format_first_win_edison',
	'format_first_win_jtp',
	'format_first_win_genesys',
]);

export const achievementArt = (code: string | null): { src: string; srcSet: string } | null => {
	const slug = (code ?? '').toLowerCase().replaceAll(':', '_');
	if (!WITH_ART.has(slug)) return null;
	const at = (size: number) => `/achievements/${slug}-${size}.webp`;
	return { src: at(64), srcSet: `${at(64)} 1x, ${at(128)} 2x` };
};
