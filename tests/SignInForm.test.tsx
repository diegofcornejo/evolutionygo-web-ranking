import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { SignInForm } from '../src/components/Auth/SignInForm';
import { toast } from 'sonner';
import { updateSession } from '../src/stores/sessionStore';

vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
vi.mock('../src/stores/sessionStore', () => ({ updateSession: vi.fn() }));

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

describe('SignInForm', () => {
  const dialog = 'test-dialog';
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    document.body.innerHTML = `<dialog id="${dialog}"></dialog>`;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and password fields', () => {
    render(<SignInForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('switches to forgot password mode', () => {
    render(<SignInForm dialog={dialog} />);
    fireEvent.click(screen.getByText('Forgot password?'));
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({ message: 'fail' }) }));
    render(<SignInForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('Sign in'));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });

  it('calls updateSession on successful login', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true, json: async () => ({ token: 't', id: 1, username: 'u' }) }));
    render(<SignInForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('Sign in'));
    await waitFor(() => expect(updateSession).toHaveBeenCalled());
  });

  it('shows toast on forgot password success', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true, json: async () => ({}) }));
    render(<SignInForm dialog={dialog} />);
    fireEvent.click(screen.getByText('Forgot password?'));
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByText('Reset Password'));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });
}); 