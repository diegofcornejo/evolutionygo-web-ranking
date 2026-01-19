vi.mock('sonner', async () => {
  return {
    __esModule: true,
    toast: { success: vi.fn() }
  };
});
vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { SignUpForm } from '@components/Auth/SignUpForm';

function mockResponse({ ok = true, statusText = '', json = async () => ({}) }) {
  return {
    ok,
    status: ok ? 200 : 400,
    statusText,
    json,
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: function () { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => '',
    bytes: async () => new Uint8Array(),
  };
}

describe('SignUpForm', () => {
  const dialog = 'test-dialog';
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    document.body.innerHTML = `<dialog id="${dialog}"></dialog>`;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and username fields', () => {
    render(<SignUpForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('shows error on failed registration', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({ message: 'fail' }) }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });
}); 