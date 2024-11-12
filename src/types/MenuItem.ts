export type MenuItem = {
	name: string;
	href: string;
	submenu?: MenuItem[];
	target?: string;
	disabled?: boolean;
	comingSoon?: boolean;
};
