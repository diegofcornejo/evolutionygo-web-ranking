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
import { toast } from 'sonner';

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

describe('SignUpForm', () => {
  const dialog = 'test-dialog';
  let mockClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() => Promise.resolve(mockResponse({})));
    mockClose = vi.fn();
    document.body.innerHTML = `<dialog id="${dialog}"></dialog>`;
    vi.spyOn(document, 'getElementById').mockReturnValue({ close: mockClose } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email and username fields', () => {
    render(<SignUpForm dialog={dialog} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('submits form successfully and shows toast', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: true }));
    render(<SignUpForm dialog={dialog} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Registration successful, please verify your email',
        { position: 'bottom-center' }
      );
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it('shows error on failed registration', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({ message: 'fail' }) }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });

  it('shows conflict error when email already exists', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, status: 409, statusText: 'Conflict' }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(screen.getByText('Email or username already in use')).toBeInTheDocument());
  });

  it('shows default error message when no message provided', async () => {
    (fetch as any).mockResolvedValueOnce(mockResponse({ ok: false, json: async () => ({}) }));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(screen.getByText('Error in registration')).toBeInTheDocument());
  });

  it('shows connection error on network failure', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));
    render(<SignUpForm dialog={dialog} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } });
    fireEvent.click(screen.getByText('Register'));
    await waitFor(() => expect(screen.getByText('No connection to server')).toBeInTheDocument());
  });

  it('closes modal when close button is clicked', () => {
    render(<SignUpForm dialog={dialog} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockClose).toHaveBeenCalled();
  });
}); 
