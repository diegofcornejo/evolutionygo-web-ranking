import { persistentAtom } from '@nanostores/persistent';

export const tokenStore = persistentAtom<string | undefined>('token', undefined);
