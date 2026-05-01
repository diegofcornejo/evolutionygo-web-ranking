import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { Session } from '@types';

const session = persistentAtom<string>('session', '', {
	encode: JSON.stringify,
	decode: JSON.parse,
});

const getSession = () => {
	return JSON.parse(session.get() || '{}') as Session;
};

const updateSession = (sessionData: Session) => {
	session.set(JSON.stringify(sessionData));
};

const currentNavPath = atom<string>('');

const setNavPath = (path: string) => {
	currentNavPath.set(path);
};

export { session, getSession, updateSession, currentNavPath, setNavPath };
