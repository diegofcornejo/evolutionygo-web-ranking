/**
 * Client-side password policy — strong secure_password rules.
 *
 * The API is the source of truth and enforces the policy server-side; this
 * mirrors the rules purely for instant UX feedback — inline validation and a
 * strength meter on the register / set-password forms. Keep in sync with the
 * API's rules. NEVER treat a client-side pass as authorization.
 */
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleId = 'length' | 'lowercase' | 'uppercase' | 'digit';

export interface PasswordRuleCheck {
  id: PasswordRuleId;
  passed: boolean;
}

export interface PasswordEvaluation {
  /** True when every required rule is satisfied. */
  valid: boolean;
  /** 0..4 — how many rules pass; drives the strength meter. */
  score: 0 | 1 | 2 | 3 | 4;
  rules: PasswordRuleCheck[];
}

const RULES: ReadonlyArray<{ id: PasswordRuleId; test: (pw: string) => boolean }> = [
  { id: 'length', test: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
  { id: 'lowercase', test: (pw) => /[a-z]/.test(pw) },
  { id: 'uppercase', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'digit', test: (pw) => /\d/.test(pw) },
];

export function evaluatePassword(pw: string): PasswordEvaluation {
  const rules = RULES.map((rule) => ({ id: rule.id, passed: rule.test(pw) }));
  const passed = rules.filter((rule) => rule.passed).length;
  return {
    valid: passed === RULES.length,
    score: passed as PasswordEvaluation['score'],
    rules,
  };
}

export function isPasswordValid(pw: string): boolean {
  return evaluatePassword(pw).valid;
}
