type Link = {
	icon: string;
	url: string;
};

export type CrewMember = {
	name: string;
	role: string;
	picture: string;
	links?: Link[];
};
