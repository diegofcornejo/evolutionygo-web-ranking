vi.mock('sonner', async () => {
  return {
    __esModule: true,
    toast: { success: vi.fn() }
  };
});
vi.mock('react-svg', () => ({ ReactSVG: () => <span data-testid="svg" /> }));
vi.mock('@stores/sessionStore', () => ({ updateSession: vi.fn() }));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { SignUpForm } from '@components/Auth/SignUpForm';
import { updateSession } from '@stores/sessionStore';

type MockResponseOptions = {
  ok?: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
};

function mockResponse({ ok = true, status, statusText = '', json = async () => ({}) }: MockResponseOptions) {
  return {
    ok,
    status: status ?? (ok ? 200 : 400),
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

const VALID_PASSWORD = 'Strong1pass';

describe('SignUpForm', () => {
  const dialog = 'test-dialog';
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    mockClose = vi.fn();
    document.body.innerHTML = `<dialog id="${dialog}"></dialog>`;
    vi.spyOn(document, 'getElementById').mockReturnValue({ close: mockClose } as any);
    Object.defineProperty(window, 'location', {
      value: { href: '', replace: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and username fields', () => {
    render(<SignUpForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  // Credential model note — explains two-credential model to new users
  it('renders a note explaining the separate dueling PIN credential', () => {
    render(<SignUpForm dialog={dialog} />);
    expect(screen.getByText(/separate dueling pin/i)).toBeInTheDocument();
  });

  // SC-REGISTER-1 — form renders password, confirm-password, and PasswordStrengthMeter
  it('renders password and confirm-password fields with PasswordStrengthMeter (SC-REGISTER-1)', () => {
    render(<SignUpForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(document.querySelector('[data-rule-id="length"]')).toBeInTheDocument();
  });

  // SC-REGISTER-2 — short password (7 chars, fails length rule) disables submit
  it('disables submit when password does not pass policy (SC-REGISTER-2)', () => {
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'short1A' } });
    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled();
  });

  // SC-REGISTER-3 — confirm mismatch disables submit and shows error text
  it('disables submit and shows mismatch message when passwords do not match (SC-REGISTER-3)', () => {
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Strong1pass' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'Differ1pass' } });
    expect(screen.getByRole('button', { name: /register/i })).toBeDisabled();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  // SC-REGISTER-4 — fetch body has {email, username, password}, no pin, no confirmPassword
  it('sends {email, username, password} in body — no pin or confirmPassword (SC-REGISTER-4)', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: async () => ({ id: 2, username: 'u2', email: 'e@e.com', token: 'regTok', gamePassword: 'aB3x' }),
    }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'e@e.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'u2' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body).toHaveProperty('email', 'e@e.com');
    expect(body).toHaveProperty('username', 'u2');
    expect(body).toHaveProperty('password', VALID_PASSWORD);
    expect(body).not.toHaveProperty('pin');
    expect(body).not.toHaveProperty('confirmPassword');
  });

  // SC-REGISTER-5 — auto-login: updateSession({token, mustUpgrade:false}) + PIN shown, no immediate redirect
  it('calls updateSession and shows game PIN on success — no immediate redirect (SC-REGISTER-5)', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: async () => ({ id: 2, username: 'u2', email: 'e@e.com', token: 'regTok', gamePassword: 'aB3x' }),
    }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'e@e.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'u2' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(updateSession).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'regTok', mustUpgrade: false })
      );
      expect(screen.getByTestId('game-pin-value')).toHaveTextContent('aB3x');
      expect(window.location.href).not.toBe('/');
    });
  });

  // SC-REGISTER-8 — clicking Continue on PIN screen navigates to '/'
  it('navigates to "/" when Continue is clicked on the PIN screen (SC-REGISTER-8)', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: async () => ({ id: 2, username: 'u2', email: 'e@e.com', token: 'regTok', gamePassword: 'aB3x' }),
    }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'e@e.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'u2' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(window.location.href).toBe('/');
  });

  // SC-REGISTER-9 — clicking Copy on PIN screen calls clipboard.writeText with the PIN
  it('copies the game PIN to clipboard when Copy is clicked (SC-REGISTER-9)', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    (fetch as any).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: async () => ({ id: 2, username: 'u2', email: 'e@e.com', token: 'regTok', gamePassword: 'aB3x' }),
    }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'e@e.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'u2' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeText).toHaveBeenCalledWith('aB3x');
  });

  // SC-REGISTER-6 — 409 conflict: error visible, no navigation to '/'
  it('shows conflict error on 409 and does not navigate (SC-REGISTER-6)', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, status: 409, statusText: 'Conflict' }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText('Email or username already in use')).toBeInTheDocument());
    expect(window.location.href).not.toBe('/');
  });

  // SC-REGISTER-7 — network failure: 'No connection to server'
  it('shows "No connection to server" on network failure (SC-REGISTER-7)', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText('No connection to server')).toBeInTheDocument());
  });

  it('shows error on failed registration', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({ message: 'fail' }) }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });

  it('shows default error message when no message provided', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({}) }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: VALID_PASSWORD } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: VALID_PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText('Error in registration')).toBeInTheDocument());
  });

  it('closes modal when close button is clicked', () => {
    render(<SignUpForm dialog={dialog} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockClose).toHaveBeenCalled();
  });
});
