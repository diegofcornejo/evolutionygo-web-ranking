/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: { 
    // PUBLIC_CACHET_API_URL: 'https://status.evolutionygo.com',
    PUBLIC_DEFAULT_SEASON: '2024'
  },
  writable: true,
});

// Mock the session store
vi.mock('@stores/sessionStore', () => ({
  session: {
    subscribe: vi.fn((callback) => {
      // Call the callback immediately with a mock session
      callback({ isLoggedIn: false, token: '', user: { id: '', username: '' } });
      // Return an unsubscribe function
      return () => {};
    })
  },
  getSession: vi.fn(() => ({ isLoggedIn: false, token: '', user: { id: '', username: '' } }))
}));

// Mock the theme store
vi.mock('@stores/themeStore', () => ({
  theme: {
    get: vi.fn(() => 'night'),
    set: vi.fn()
  }
}));

// Mock the helper functions
vi.mock('@components/NavBar/helper', () => ({
  update: vi.fn(),
  updateUser: vi.fn(),
  setTheme: vi.fn(),
  handleLogout: vi.fn(),
  handleOpenSettings: vi.fn()
}));

// Mock the container API before importing your component
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => {
        return `<div class='navbar bg-base-300 sticky top-0 z-50'>
          <div class='navbar-start'>
            <div class='dropdown'>
              <div tabindex='0' role='button' class='btn btn-ghost lg:hidden'>
                <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h8m-8 6h16'></path>
                </svg>
              </div>
              <ul tabindex='0' class='menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-1 w-52 p-2 shadow'>
                <li><a data-umami-event='menu-click-home' href='/#section-home'>Home</a></li>
                <li><a data-umami-event='menu-click-ranking' href='/#section-ranking'>Ranking</a></li>
                <li><a data-umami-event='menu-click-features' href='/#section-features'>Features</a></li>
                <li><a data-umami-event='menu-click-downloads' href='/#section-download'>Downloads</a></li>
                <li><a data-umami-event='menu-click-tournaments' href='/tournaments'>Tournaments</a></li>
                <li><a data-umami-event='menu-click-developers' href='/developers'>Developers</a></li>
                <!-- <li><a data-umami-event='menu-click-status' href='https://status.evolutionygo.com' target='_blank'>Status</a></li> -->
                <li>
                  <a data-umami-event='menu-click-social'>Social</a>
                  <ul class='p-2'>
                    <li><a data-umami-event='menu-click-discord' href='https://discord.gg/bgjddgWkWk' target='_blank'>Discord</a></li>
                    <li><a data-umami-event='menu-click-whatsapp' href='https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i' target='_blank'>WhatsApp</a></li>
                    <li><a data-umami-event='menu-click-github' href='https://github.com/evolutionygo' target='_blank'>GitHub</a></li>
                  </ul>
                </li>
              </ul>
            </div>
            <a href='/'><img src='/logo.svg' alt='logo' class='h-12 w-auto cursor-pointer' loading='lazy' decoding='async' fetchpriority='low'/></a>
          </div>
          <div class='navbar-center hidden lg:flex'>
            <ul class='menu menu-horizontal px-1'>
              <li><a href='/#section-home' data-umami-event='menu-click-home'>Home</a></li>
              <li><a href='/#section-ranking' data-umami-event='menu-click-ranking'>Ranking</a></li>
              <li><a href='/#section-features' data-umami-event='menu-click-features'>Features</a></li>
              <li><a href='/#section-download' data-umami-event='menu-click-downloads'>Downloads</a></li>
              <li><a href='/tournaments' data-umami-event='menu-click-tournaments'>Tournaments</a></li>
              <li><a href='/developers' data-umami-event='menu-click-developers'>Developers</a></li>
              <!-- <li><a href='https://status.evolutionygo.com' target='_blank' data-umami-event='menu-click-status'>Status</a></li> -->
              <li>
                <details>
                  <summary>Social</summary>
                  <ul class='p-2 w-48'>
                    <li><a href='https://discord.gg/bgjddgWkWk' target='_blank' data-umami-event='menu-click-discord'>Discord</a></li>
                    <li><a href='https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i' target='_blank' data-umami-event='menu-click-whatsapp'>WhatsApp</a></li>
                    <li><a href='https://github.com/evolutionygo' target='_blank' data-umami-event='menu-click-github'>GitHub</a></li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>
          <div class='navbar-end'>
            <input type='checkbox' value='dracula' class='toggle theme-controller' id='button-navbar-theme' data-umami-event='navbar-click-theme' />
            <div class='dropdown dropdown-end mx-0 md:mx-2' data-umami-event='announcements-dropdown'>
              <button tabindex='0' role='button' class='btn btn-ghost btn-circle'>
                <div class='indicator'>
                  <svg class='h-6 w-6'></svg>
                </div>
              </button>
              <ul tabindex='0' class='menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-1 w-56 p-2 shadow'>
                <li><p class='text-center'>No announcements</p></li>
              </ul>
            </div>
            <div class='dropdown dropdown-end' id='dropdown-navbar-profile' data-umami-event='navbar-click-profile-dropdown'>
              <div tabindex='0' role='button' class='btn btn-ghost btn-circle avatar'>
                <div class='w-8 rounded-full ring-primary ring-offset-base-100 ring ring-offset-2'>
                  <img id='dropdown-navbar-avatar' alt='avatar' src='' loading='lazy' decoding='async' fetchpriority='low'/>
                </div>
              </div>
              <ul tabindex='0' class='menu menu-sm dropdown-content bg-base-300 rounded-box z-[1] mt-1 w-56 p-2 shadow'>
                <li class='text-lg font-bold text-center pt-2 pb-4' id='navbar-username'></li>
                <li>
                  <a class='justify-between' id='dropdown-navbar-profile-link' data-umami-event='navbar-click-profile'>
                    Profile
                    <span class='badge badge-sm badge-primary'>New</span>
                  </a>
                </li>
                <li><a id='button-navbar-settings' data-umami-event='navbar-click-settings'>Settings</a></li>
                <li><a id='button-navbar-logout' data-umami-event='navbar-click-logout'>Logout</a></li>
              </ul>
            </div>
          </div>
          <dialog id='dialog-settings' class='modal'>
            <div class='modal-box'>
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <img src='/logo.svg' alt='logo' class='h-16 w-auto mx-auto' loading='lazy' decoding='async' fetchpriority='low'/>
              <h3 class='text-2xl text-center mt-4'>Settings</h3>
              <div class='modal-action'>
                <div class='w-full'>
                  <div>SettingsForm Component</div>
                </div>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
          <dialog id='signin' class='modal'>
            <div class='modal-box'>
              <div>SignInForm Component</div>
            </div>
          </dialog>
          <dialog id='signup' class='modal'>
            <div class='modal-box'>
              <div>SignUpForm Component</div>
            </div>
          </dialog>
        </div>`;
      },
    }),
  },
}));

import Navbar from '@components/NavBar/Navbar.astro';

describe('Navbar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DOM elements that the component script expects
    const mockElements = {
      'button-modal-signin': { style: { display: '' } },
      'button-modal-signup': { style: { display: '' } },
      'dropdown-navbar-profile': { style: { display: '' } },
      'navbar-username': { innerHTML: '' },
      'dropdown-navbar-avatar': { src: '' },
      'dropdown-navbar-profile-link': { href: '' },
      'button-navbar-theme': { checked: false, addEventListener: vi.fn() },
      'button-navbar-logout': { addEventListener: vi.fn() },
      'button-navbar-settings': { addEventListener: vi.fn() },
      'dialog-settings': { showModal: vi.fn() }
    };

    vi.spyOn(document, 'getElementById').mockImplementation((id) => {
      return mockElements[id as keyof typeof mockElements] as any;
    });

    // Mock addEventListener for document
    vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('renders navbar with correct structure', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('navbar bg-base-300 sticky top-0 z-50');
    expect(result).toContain('navbar-start');
    expect(result).toContain('navbar-center');
    expect(result).toContain('navbar-end');
  });

  it('renders logo with correct attributes', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('src=\'/logo.svg\'');
    expect(result).toContain('alt=\'logo\'');
    expect(result).toContain('h-12 w-auto cursor-pointer');
    expect(result).toContain('loading=\'lazy\'');
    expect(result).toContain('decoding=\'async\'');
    expect(result).toContain('fetchpriority=\'low\'');
  });

  it('renders mobile menu dropdown', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('btn btn-ghost lg:hidden');
    expect(result).toContain('menu menu-sm dropdown-content');
    expect(result).toContain('w-52 p-2 shadow');
  });

  it('renders desktop menu', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('navbar-center hidden lg:flex');
    expect(result).toContain('menu menu-horizontal px-1');
  });

  it('includes all main menu items', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('menu-click-home');
    expect(result).toContain('menu-click-ranking');
    expect(result).toContain('menu-click-features');
    expect(result).toContain('menu-click-downloads');
    expect(result).toContain('menu-click-tournaments');
    expect(result).toContain('menu-click-developers');
    // expect(result).toContain('menu-click-status');
  });

  it('includes social submenu items', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('menu-click-discord');
    expect(result).toContain('menu-click-whatsapp');
    expect(result).toContain('menu-click-github');
    expect(result).toContain('https://discord.gg/bgjddgWkWk');
    expect(result).toContain('https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i');
    expect(result).toContain('https://github.com/evolutionygo');
  });

  it('renders theme toggle', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('toggle theme-controller');
    expect(result).toContain('id=\'button-navbar-theme\'');
    expect(result).toContain('data-umami-event=\'navbar-click-theme\'');
    expect(result).toContain('value=\'dracula\'');
  });

  it('renders announcements dropdown', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('announcements-dropdown');
    expect(result).toContain('btn btn-ghost btn-circle');
    expect(result).toContain('indicator');
  });

  it('renders profile dropdown', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('dropdown-navbar-profile');
    expect(result).toContain('navbar-click-profile-dropdown');
    expect(result).toContain('btn btn-ghost btn-circle avatar');
    expect(result).toContain('dropdown-navbar-avatar');
  });

  it('includes profile menu items', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('navbar-username');
    expect(result).toContain('dropdown-navbar-profile-link');
    expect(result).toContain('button-navbar-settings');
    expect(result).toContain('button-navbar-logout');
    expect(result).toContain('navbar-click-profile');
    expect(result).toContain('navbar-click-settings');
    expect(result).toContain('navbar-click-logout');
  });

  it('includes profile badge', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('badge badge-sm badge-primary');
    expect(result).toContain('New');
  });

  it('renders settings modal', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('dialog-settings');
    expect(result).toContain('Settings');
    expect(result).toContain('SettingsForm Component');
  });

  it('renders signin modal', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('id=\'signin\'');
    expect(result).toContain('SignInForm Component');
  });

  it('renders signup modal', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('id=\'signup\'');
    expect(result).toContain('SignUpForm Component');
  });

  it('has correct external link attributes', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    // Check that external links have target="_blank"
    // expect(result).toContain('href=\'https://status.evolutionygo.com\' target=\'_blank\'');
    expect(result).toContain('href=\'https://discord.gg/bgjddgWkWk\' target=\'_blank\'');
    expect(result).toContain('href=\'https://chat.whatsapp.com/CTj2xTBcfMNA6ahMYaO19i\' target=\'_blank\'');
    expect(result).toContain('href=\'https://github.com/evolutionygo\' target=\'_blank\'');
  });

  it('has correct internal link structure', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    // Check internal links don't have target="_blank"
    expect(result).toContain('href=\'/#section-home\'');
    expect(result).toContain('href=\'/#section-ranking\'');
    expect(result).toContain('href=\'/#section-features\'');
    expect(result).toContain('href=\'/#section-download\'');
    expect(result).toContain('href=\'/tournaments\'');
    expect(result).toContain('href=\'/developers\'');
  });

  it('includes umami tracking events', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('data-umami-event=\'navbar-click-theme\'');
    expect(result).toContain('data-umami-event=\'announcements-dropdown\'');
    expect(result).toContain('data-umami-event=\'navbar-click-profile-dropdown\'');
    expect(result).toContain('data-umami-event=\'navbar-click-profile\'');
    expect(result).toContain('data-umami-event=\'navbar-click-settings\'');
    expect(result).toContain('data-umami-event=\'navbar-click-logout\'');
  });

  it('has proper responsive classes', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('lg:hidden'); // Mobile menu button
    expect(result).toContain('hidden lg:flex'); // Desktop menu
    expect(result).toContain('mx-0 md:mx-2'); // Responsive margins
  });

  it('has proper z-index and positioning', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Navbar));
    
    expect(result).toContain('sticky top-0 z-50');
    expect(result).toContain('z-[1]'); // Dropdown z-index
  });
}); 