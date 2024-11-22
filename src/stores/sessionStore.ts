import { persistentAtom } from '@nanostores/persistent';
import type { Session } from 'src/types/types';

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

export { session, getSession, updateSession, updateSessionProperty };