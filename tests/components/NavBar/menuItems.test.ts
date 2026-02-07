import { describe, it, expect } from 'vitest';
import menuItems from '@components/NavBar/menuItems';

describe('NavBar Menu Items', () => {
  it('exports an array of menu items', () => {
    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('contains expected main menu items', () => {
    const menuNames = menuItems.map(item => item.name);
    
    expect(menuNames).toContain('Home');
    expect(menuNames).toContain('Ranking');
    expect(menuNames).toContain('Features');
    expect(menuNames).toContain('Downloads');
    expect(menuNames).toContain('Commands');
    expect(menuNames).toContain('Tournaments');
    // expect(menuNames).toContain('Developers');
    expect(menuNames).toContain('Stats');
    expect(menuNames).toContain('Status');
    expect(menuNames).toContain('Social');
  });

  it('has correct structure for simple menu items', () => {
    const homeItem = menuItems.find(item => item.name === 'Home');
    
    expect(homeItem).toBeDefined();
    expect(homeItem?.href).toBe('/#section-home');
    expect(homeItem?.trackEvent).toBe('menu-click-home');
    expect(homeItem?.submenu).toBeUndefined();
  });

  it('has correct structure for external links', () => {
    const statusItem = menuItems.find(item => item.name === 'Status');
    
    expect(statusItem).toBeDefined();
    expect(statusItem?.href).toBe('https://status.evolutionygo.com');
    expect(statusItem?.target).toBe('_blank');
    expect(statusItem?.trackEvent).toBe('menu-click-status');
  });

  it('has correct structure for Commands item', () => {
    const commandsItem = menuItems.find(item => item.name === 'Commands');
    
    expect(commandsItem).toBeDefined();
    expect(commandsItem?.href).toBe('/#special-commands');
    expect(commandsItem?.trackEvent).toBe('menu-click-commands');
  });

  it('has correct structure for Stats item', () => {
    const statsItem = menuItems.find(item => item.name === 'Stats');
    
    expect(statsItem).toBeDefined();
    expect(statsItem?.href).toBe('/stats');
    expect(statsItem?.trackEvent).toBe('menu-click-stats');
    if (statsItem?.badgeLabel) {
      expect(typeof statsItem.badgeClass).toBe('string');
    }
  });

  it('has correct structure for disabled items', () => {
    const tournamentsItem = menuItems.find(item => item.name === 'Tournaments');
    
    expect(tournamentsItem).toBeDefined();
    expect(tournamentsItem?.disabled).toBe(true);
    expect(tournamentsItem?.comingSoon).toBe(true);
    expect(tournamentsItem?.trackEvent).toBe('menu-click-tournaments');
  });

  it('has correct structure for submenu items', () => {
    const socialItem = menuItems.find(item => item.name === 'Social');
    
    expect(socialItem).toBeDefined();
    expect(socialItem?.icon).toBe('mdi:share-variant');
    expect(socialItem?.submenu).toBeDefined();
    expect(Array.isArray(socialItem?.submenu)).toBe(true);
    expect(socialItem?.submenu?.length).toBe(3);
  });

  it('has correct submenu structure for Social menu', () => {
    const socialItem = menuItems.find(item => item.name === 'Social');
    const submenu = socialItem?.submenu;
    
    expect(submenu).toBeDefined();
    
    const discordItem = submenu?.find(item => item.name === 'Discord');
    expect(discordItem).toBeDefined();
    expect(discordItem?.href).toBe('https://discord.gg/bgjddgWkWk');
    expect(discordItem?.target).toBe('_blank');
    expect(discordItem?.icon).toBe('mdi:discord');
    expect(discordItem?.trackEvent).toBe('menu-click-discord');

    const whatsappItem = submenu?.find(item => item.name === 'WhatsApp');
    expect(whatsappItem).toBeDefined();
    expect(whatsappItem?.href).toBe('https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i');
    expect(whatsappItem?.target).toBe('_blank');
    expect(whatsappItem?.icon).toBe('mdi:whatsapp');
    expect(whatsappItem?.trackEvent).toBe('menu-click-whatsapp');

    const githubItem = submenu?.find(item => item.name === 'GitHub');
    expect(githubItem).toBeDefined();
    expect(githubItem?.href).toBe('https://github.com/evolutionygo');
    expect(githubItem?.target).toBe('_blank');
    expect(githubItem?.icon).toBe('mdi:github');
    expect(githubItem?.trackEvent).toBe('menu-click-github');
  });

  it('all menu items have required properties', () => {
    menuItems.forEach(item => {
      expect(item.name).toBeDefined();
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      
      if (item.trackEvent) {
        expect(typeof item.trackEvent).toBe('string');
        expect(item.trackEvent.length).toBeGreaterThan(0);
      }
      
      // Either href or submenu should be defined
      expect(item.href || item.submenu).toBeDefined();
    });
  });

  it('all submenu items have required properties', () => {
    menuItems.forEach(item => {
      if (item.submenu) {
        item.submenu.forEach(subitem => {
          expect(subitem.name).toBeDefined();
          expect(typeof subitem.name).toBe('string');
          expect(subitem.name.length).toBeGreaterThan(0);
          
          if (subitem.href) {
            expect(typeof subitem.href).toBe('string');
            expect(subitem.href.length).toBeGreaterThan(0);
          }
          
          if (subitem.trackEvent) {
            expect(typeof subitem.trackEvent).toBe('string');
            expect(subitem.trackEvent.length).toBeGreaterThan(0);
          }
        });
      }
    });
  });

  it('all track events follow naming convention', () => {
    menuItems.forEach(item => {
      if (item.trackEvent) {
        expect(item.trackEvent).toMatch(/^menu-click-/);
      }
      
      if (item.submenu) {
        item.submenu.forEach(subitem => {
          if (subitem.trackEvent) {
            expect(subitem.trackEvent).toMatch(/^menu-click-/);
          }
        });
      }
    });
  });

  it('external links have target="_blank"', () => {
    menuItems.forEach(item => {
      if (item.href && item.href.startsWith('http')) {
        expect(item.target).toBe('_blank');
      }
      
      if (item.submenu) {
        item.submenu.forEach(subitem => {
          if (subitem.href && subitem.href.startsWith('http')) {
            expect(subitem.target).toBe('_blank');
          }
        });
      }
    });
  });

  it('internal links do not have target attribute', () => {
    menuItems.forEach(item => {
      if (item.href && !item.href.startsWith('http')) {
        expect(item.target).toBeUndefined();
      }
    });
  });
}); 
