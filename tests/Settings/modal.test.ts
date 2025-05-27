/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

// Mock the container API before importing your component
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: () =>
        `<dialog id='dialog-settings' class='modal'>
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
        </dialog>`,
    }),
  },
}));

import Modal from '../../src/components/Settings/Modal.astro';

describe('Settings Modal component', () => {
  it('renders modal with correct structure', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal));
    
    expect(result).toContain('dialog-settings');
    expect(result).toContain('modal');
    expect(result).toContain('Settings');
    expect(result).toContain('/logo.svg');
  });

  it('includes close button', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal));
    
    expect(result).toContain('btn-circle');
    expect(result).toContain('✕');
  });

  it('includes modal backdrop for closing', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal));
    
    expect(result).toContain('modal-backdrop');
    expect(result).toContain('close');
  });

  it('has proper modal structure with modal-box', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal));
    
    expect(result).toContain('modal-box');
    expect(result).toContain('modal-action');
  });

  it('includes logo and title', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal));
    
    expect(result).toContain('logo');
    expect(result).toContain('Settings');
    expect(result).toContain('text-2xl');
  });
}); 