import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
	const seasonId = url.searchParams.get('seasonId');
	const playerId = url.searchParams.get('playerId');
	const authorization = request.headers.get('authorization');

	if (!seasonId || !playerId) {
		return new Response(
			JSON.stringify({ message: 'seasonId and playerId are required' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	if (!authorization) {
		return new Response(JSON.stringify({ message: 'Authorization header is required' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const endpoint = `${import.meta.env.PUBLIC_API_URL}/seasons/${encodeURIComponent(seasonId)}/wrapped/${encodeURIComponent(playerId)}/html?theme=valentines`;
		const response = await fetch(endpoint, {
			headers: {
				Authorization: authorization,
				Accept: 'text/html',
			},
		});

		if (!response.ok) {
			const message = await response.text().catch(() => 'Failed to generate wrapped');
			return new Response(JSON.stringify({ message }), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const html = await response.text();
		return new Response(html, {
			status: 200,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'no-store',
			},
		});
	} catch (error) {
		console.error('Wrapped proxy error:', error);
		return new Response(JSON.stringify({ message: 'No connection to wrapped service' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
