/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
	readonly PUBLIC_ANALYTICS_ID: string;
	readonly PUBLIC_ANALYTICS_URL: string;
	readonly PUBLIC_DD_RUM_CLIENT_TOKEN: string;
	readonly PUBLIC_DD_RUM_APP_ID: string;
	readonly PUBLIC_DD_RUM_SERVICE: string;
	// Feature Flags
	readonly PUBLIC_FF_SHOW_SNOW_EFFECT: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '*.astro' {
	const component: any;
	export default component;
}

declare module '@stores/sessionStore' {
	import type { Atom } from 'nanostores';
	import type { Session } from '@types';

	export const session: Atom<string>;
	export const getSession: () => Session;
	export const updateSession: (sessionData: Session) => void;
	export const updateSessionProperty: <K extends keyof Session>(property: K, value: Session[K]) => void;
	export const currentNavPath: Atom<string>;
	export const setNavPath: (path: string) => void;
}
