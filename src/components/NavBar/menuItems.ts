import type { MenuItem } from '@types';

const menuItems: MenuItem[] = [
	{
		name: 'Home',
		href: '/#section-home',
		trackEvent: 'menu-click-home',
	},
	{
		name: 'Ranking',
		href: '/#section-ranking',
		trackEvent: 'menu-click-ranking',
	},
	{
		name: 'Features',
		href: '/#section-features',
		trackEvent: 'menu-click-features',
	},
	{
		name: 'Downloads',
		href: '/#section-download',
		trackEvent: 'menu-click-downloads',
	},
	{
		name: 'Commands',
		href: '/#special-commands',
		trackEvent: 'menu-click-commands',
	},
	{
		name: 'Tournaments',
		href: '/tournaments',
		disabled: true,
		comingSoon: true,
		trackEvent: 'menu-click-tournaments',
	},
	{
		name: 'Developers',
		href: '/developers',
		trackEvent: 'menu-click-developers',
	},
	{
		name: 'Status',
		href: 'https://status.evolutionygo.com',
		target: '_blank',
		trackEvent: 'menu-click-status',
	},
	{
		name: 'Social',
		icon: 'mdi:share-variant',
		submenu: [
			{
				name: 'Discord',
				href: 'https://discord.gg/bgjddgWkWk',
				target: '_blank',
				icon: 'mdi:discord',
				trackEvent: 'menu-click-discord',
			},
			{
				name: 'WhatsApp',
				href: 'https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i',
				target: '_blank',
				icon: 'mdi:whatsapp',
				trackEvent: 'menu-click-whatsapp',
			},
			{
				name: 'GitHub',
				href: 'https://github.com/evolutionygo',
				target: '_blank',
				icon: 'mdi:github',
				trackEvent: 'menu-click-github',
			},
		],
	},
];

export default menuItems;
