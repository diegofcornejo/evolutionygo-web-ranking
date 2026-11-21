import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@components/Auth', async () => {
  const SimpleReact = (await import('../__mocks__/SimpleReact')).default;
  return { SignInForm: SimpleReact, SignUpForm: SimpleReact };
});

const renderNavbar = async () => {
  const Navbar = (await import('../../src/components/NavBar/Navbar.astro')).default;
  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
  const html = await container.renderToString(Navbar);
  return new JSDOM(html).window.document;
};

describe('Navbar layout', () => {
  it('keeps Login and Register inside navbar-end so the menu stays centered', async () => {
    const document = await renderNavbar();
    const nav = document.querySelector('nav.navbar')!;

    expect(nav.querySelector('.navbar-end #button-modal-signin')).not.toBeNull();
    expect(nav.querySelector('.navbar-end #button-modal-signup')).not.toBeNull();
    const looseChildren = [...nav.children].filter(
      (child) => !child.matches('.navbar-start, .navbar-center, .navbar-end, dialog')
    );
    expect(looseChildren).toHaveLength(0);
  });

  it('shows only the V0 mark on phones and the wordmark from sm up', async () => {
    const document = await renderNavbar();
    const mark = document.querySelector('.navbar-start img[src="/favicon.svg"]')!;
    const wordmark = document.querySelector('.navbar-start img[src="/logo.svg"]')!;

    expect(mark).not.toBeNull();
    expect(mark.classList.contains('sm:hidden')).toBe(true);
    expect(wordmark.classList.contains('hidden')).toBe(true);
    expect(wordmark.classList.contains('sm:block')).toBe(true);
  });

  it('draws the wordmark at EvoDuel’s size without letterboxing', async () => {
    const document = await renderNavbar();
    const logo = document.querySelector('.navbar-start img[src="/logo.svg"]')!;

    expect(logo.getAttribute('width')).toBe('184');
    expect(logo.getAttribute('height')).toBe('34');
    expect(logo.classList.contains('h-8.5')).toBe(true);
    expect(logo.parentElement!.classList.contains('shrink-0')).toBe(true);
  });
});
