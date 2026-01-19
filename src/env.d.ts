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
