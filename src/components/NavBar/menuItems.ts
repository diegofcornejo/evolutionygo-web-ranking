type MenuItem = {
  name: string;
  href: string;
  submenu?: MenuItem[];
  target?: string;
};

// Exportación por defecto de `menuItems`
const menuItems: MenuItem[] = [
  {
    name: 'News',
    href: '/news',
  },
  {
    name: 'Ranking',
    href: '/ranking',
    submenu: [
      {
        name: 'Submenu 1',
        href: '/submenu1',
        target: '_self',
      },
      {
        name: 'Submenu 2',
        href: '/submenu2',
        target: '_self',
      },
    ],
  },
  {
    name: 'Feature',
    href: '/feature',
  },
  {
    name: 'Download',
    href: '/download',
  },
  {
    name: 'Tournaments',
    href: '/tournaments',
  },
  {
    name: 'Status',
    href: 'https://status.evolutionygo.com',
    target: '_blank',
  },
];

export default menuItems;
