import { map } from 'nanostores';

export interface FeatureFlags {
	SHOW_SNOW_EFFECT: boolean;
}

const initialFlags: FeatureFlags = {
	SHOW_SNOW_EFFECT: import.meta.env.PUBLIC_FF_SHOW_SNOW_EFFECT === 'true',
};

export const featureFlags = map<FeatureFlags>(initialFlags);

export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
	return featureFlags.get()[flag];
};

