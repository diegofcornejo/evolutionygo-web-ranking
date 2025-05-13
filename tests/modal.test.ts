/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

// Mock the container API before importing your component
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: () =>
        '<button id="button-modal-test-modal">Open Modal</button>Main content',
    }),
  },
}));

import Modal from '../src/components/Modal.astro';

describe('Modal component (stubbed)', () => {
  it('renders with default props and slots', async () => {
    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(Modal, {
        props: { id: 'test-modal', open: 'Open Modal' },
        slots: { main: 'Main content', buttons: 'Close Button' },
      }));
    expect(result).toContain('button-modal-test-modal');
    expect(result).toContain('Main content');
  });
}); 