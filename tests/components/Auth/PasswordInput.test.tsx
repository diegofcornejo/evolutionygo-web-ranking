import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PasswordInput } from '@components/Auth/PasswordInput';

describe('PasswordInput', () => {
  it('hides the password by default', () => {
    render(<PasswordInput placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles visibility when the eye is clicked', () => {
    render(<PasswordInput placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('passes input props through', () => {
    render(<PasswordInput placeholder="Password" name="password" defaultValue="secret" required />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveValue('secret');
    expect(input).toBeRequired();
    expect(input).toHaveClass('grow');
  });
});
