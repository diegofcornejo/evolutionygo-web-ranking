import { describe, it, expect } from 'vitest';
import * as AuthExports from '@components/Auth';

describe('Auth exports', () => {
  it('exposes auth form components', () => {
    expect(AuthExports.SignInForm).toBeDefined();
    expect(AuthExports.SignUpForm).toBeDefined();
    expect(AuthExports.ResetPasswordForm).toBeDefined();
  });
});
