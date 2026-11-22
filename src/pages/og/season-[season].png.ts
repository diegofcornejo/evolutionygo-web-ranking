import type { APIRoute } from 'astro';
import { renderSeasonCard } from '@utils/ogCard';

export const prerender = true;

export function getStaticPaths() {
	const season = import.meta.env.PUBLIC_DEFAULT_SEASON;
	if (!season) throw new Error('PUBLIC_DEFAULT_SEASON is not set');
	return [{ params: { season } }];
}

export const GET: APIRoute = async ({ params }) => {
	const png = await renderSeasonCard(params.season as string);
	return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
