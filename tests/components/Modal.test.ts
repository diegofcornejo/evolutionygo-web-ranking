// @vitest-environment node
/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';
import Modal from '@components/Modal.astro';

describe('Modal.astro', () => {
  it('renders modal structure with logo and buttons', async () => {
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(Modal, {
      props: {
        id: 'login',
        open: 'Login',
        close: 'Close',
        showButtons: true,
        showLogo: true,
      },
      slots: {
        main: '<div>Content</div>',
        buttons: '<button>Confirm</button>',
      },
    });

    expect(result).toContain('button-modal-login');
    expect(result).toContain('dialog');
    expect(result).toContain('logo');
    expect(result).toContain('Close');
    expect(result).toContain('Confirm');
  });
});
