// import { persistentAtom } from '@nanostores/persistent';

// export const $banlists = persistentAtom<string[]>('banlists', [], {
// 	encode: JSON.stringify,
// 	decode: JSON.parse,
// });

import { atom } from 'nanostores';

export const banlists = atom<string[]>([]);
