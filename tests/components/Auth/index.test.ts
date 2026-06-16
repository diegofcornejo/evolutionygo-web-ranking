import { describe, it, expect } from 'vitest';
import * as AuthExports from '@components/Auth';

describe('Auth exports', () => {
  it('exposes auth form components', () => {
    expect(AuthExports.SignInForm).toBeDefined();
    expect(AuthExports.SignUpForm).toBeDefined();
    expect(AuthExports.PasswordStrengthMeter).toBeDefined();
    expect(AuthExports.UpgradePasswordForm).toBeDefined();
    expect(AuthExports.ResetAccountPasswordForm).toBeDefined();
  });

  it('does not export the removed ResetPasswordForm', () => {
    expect((AuthExports as any).ResetPasswordForm).toBeUndefined();
  });
});
