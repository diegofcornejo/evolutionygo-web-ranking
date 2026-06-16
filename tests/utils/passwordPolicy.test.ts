import { describe, it, expect } from 'vitest';
import { evaluatePassword, isPasswordValid, PASSWORD_MIN_LENGTH } from '@utils/passwordPolicy';

describe('passwordPolicy', () => {
  describe('PASSWORD_MIN_LENGTH', () => {
    it('is 8', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
    });
  });

  describe('evaluatePassword — truth table (REQ-POLICY-1, REQ-POLICY-2, REQ-POLICY-3)', () => {
    it('empty string: valid=false, score=0', () => {
      const result = evaluatePassword('');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(0);
    });

    it('"Abc1234" (7 chars, no length): valid=false, score=3', () => {
      const result = evaluatePassword('Abc1234');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(3);
    });

    it('"Abc12345" (all rules pass): valid=true, score=4', () => {
      const result = evaluatePassword('Abc12345');
      expect(result.valid).toBe(true);
      expect(result.score).toBe(4);
    });

    it('"abc12345" (no uppercase): valid=false, score=3', () => {
      const result = evaluatePassword('abc12345');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(3);
    });

    it('"ABC12345" (no lowercase): valid=false, score=3', () => {
      const result = evaluatePassword('ABC12345');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(3);
    });

    it('"Abcdefgh" (no digit): valid=false, score=3', () => {
      const result = evaluatePassword('Abcdefgh');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(3);
    });

    it('"A1bcdefg" (all rules pass): valid=true, score=4', () => {
      const result = evaluatePassword('A1bcdefg');
      expect(result.valid).toBe(true);
      expect(result.score).toBe(4);
    });

    it('"        " (8 spaces, only length): valid=false, score=1', () => {
      const result = evaluatePassword('        ');
      expect(result.valid).toBe(false);
      expect(result.score).toBe(1);
    });
  });

  describe('evaluatePassword — rules array (REQ-POLICY-1)', () => {
    it('returns exactly 4 rules with correct ids', () => {
      const { rules } = evaluatePassword('Abc12345');
      expect(rules).toHaveLength(4);
      const ids = rules.map((r) => r.id);
      expect(ids).toContain('length');
      expect(ids).toContain('lowercase');
      expect(ids).toContain('uppercase');
      expect(ids).toContain('digit');
    });

    it('length rule fails for 7-char password', () => {
      const { rules } = evaluatePassword('Abc1234');
      const lengthRule = rules.find((r) => r.id === 'length');
      expect(lengthRule?.passed).toBe(false);
    });

    it('length rule passes for 8-char password', () => {
      const { rules } = evaluatePassword('Abc12345');
      const lengthRule = rules.find((r) => r.id === 'length');
      expect(lengthRule?.passed).toBe(true);
    });

    it('uppercase rule fails when no uppercase', () => {
      const { rules } = evaluatePassword('abc12345');
      const rule = rules.find((r) => r.id === 'uppercase');
      expect(rule?.passed).toBe(false);
    });

    it('lowercase rule fails when no lowercase', () => {
      const { rules } = evaluatePassword('ABC12345');
      const rule = rules.find((r) => r.id === 'lowercase');
      expect(rule?.passed).toBe(false);
    });

    it('digit rule fails when no digit', () => {
      const { rules } = evaluatePassword('Abcdefgh');
      const rule = rules.find((r) => r.id === 'digit');
      expect(rule?.passed).toBe(false);
    });
  });

  describe('isPasswordValid — REQ-POLICY-4', () => {
    it('returns true when all rules pass', () => {
      expect(isPasswordValid('Abc12345')).toBe(true);
    });

    it('returns false when any rule fails', () => {
      expect(isPasswordValid('Abc1234')).toBe(false);
      expect(isPasswordValid('abc12345')).toBe(false);
      expect(isPasswordValid('ABC12345')).toBe(false);
      expect(isPasswordValid('Abcdefgh')).toBe(false);
      expect(isPasswordValid('')).toBe(false);
    });

    it('matches evaluatePassword(...).valid', () => {
      const cases = ['Abc12345', 'Abc1234', 'abc12345', 'ABC12345', ''];
      for (const pw of cases) {
        expect(isPasswordValid(pw)).toBe(evaluatePassword(pw).valid);
      }
    });
  });
});
