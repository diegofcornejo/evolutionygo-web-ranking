export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
// Bump when the card design changes so apps fetch it again instead of showing a cached preview.
export const OG_CARD_VERSION = 1;

export function seasonCardPath(season: string): string {
	return `/og/season-${season}.png?v=${OG_CARD_VERSION}`;
}
