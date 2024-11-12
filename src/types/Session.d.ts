import type { User } from './User';

export type Session = {
	token: string;
	isLoggedIn: boolean;
	user: User;
};