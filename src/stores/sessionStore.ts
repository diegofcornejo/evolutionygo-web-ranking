// import { atom } from 'nanostores';

// export const isLoggedIn = atom(false);


import { persistentAtom } from '@nanostores/persistent';

export const isLoggedIn = persistentAtom<boolean>('isLoggedIn', false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const userName = persistentAtom<string>('userName', '');
