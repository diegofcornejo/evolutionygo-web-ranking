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

const updateSessionProperty = <K extends keyof Session>(property: K, value: Session[K]) => {
	const sessionData = getSession();
	sessionData[property] = value;
	updateSession(sessionData);
};

const currentNavPath = atom<string>('');

const setNavPath = (path: string) => {
	currentNavPath.set(path);
};

export { session, getSession, updateSession, updateSessionProperty, currentNavPath, setNavPath };
