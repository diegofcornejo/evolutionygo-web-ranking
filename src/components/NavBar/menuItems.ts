import type { MenuItem } from '@types';

// Exportación por defecto de `menuItems`
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
  // {
  //   name: 'Ranking',
  //   href: '/ranking',
  //   submenu: [
  //     {
  //       name: 'Submenu 1',
  //       href: '/submenu1',
  //       target: '_self',
  //     },
  //     {
  //       name: 'Submenu 2',
  //       href: '/submenu2',
  //       target: '_self',
  //     },
  //   ],
  // },
	{
    name: 'Tournaments',
    href: '/tournaments',
		disabled: true,
		comingSoon: true,
		trackEvent: 'menu-click-tournaments',
  },
  {
    name: 'Status',
    href: 'https://status.evolutionygo.com',
    target: '_blank',
		trackEvent: 'menu-click-status',
  },
	{
		name: 'Discord',
		href: 'https://discord.gg/bgjddgWkWk',
		target: '_blank',
		icon: 'mdi:discord',
		trackEvent: 'menu-click-discord',
	},
];

export default menuItems;
