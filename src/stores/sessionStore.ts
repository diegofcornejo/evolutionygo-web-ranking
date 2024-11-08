import { persistentAtom } from '@nanostores/persistent';

type User = {
	id: string;
	username: string;
};

export type Session = {
	token: string;
	isLoggedIn: boolean;
	user: User;
};

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