export const EVODUEL_URL = 'https://evoduel.com';
/** EvoDuel routes live in the URL hash (svelte-spa-router): `/releases` is `https://evoduel.com/#/releases`. */
export const evoDuelRoute = (route: string) => `${EVODUEL_URL}/#${route}`;
export const EVODUEL_RELEASES_URL = evoDuelRoute('/releases');
