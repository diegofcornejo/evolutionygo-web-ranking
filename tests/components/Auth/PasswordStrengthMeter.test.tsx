import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthMeter } from '@components/Auth/PasswordStrengthMeter';

describe('PasswordStrengthMeter (REQ-POLICY-5)', () => {
  function getRuleItems() {
    return screen.getAllByRole('listitem');
  }

  it('SC-POLICY-1 — all-pass: renders 4 rules, all in passing state ("Abc12345")', () => {
    render(<PasswordStrengthMeter password="Abc12345" />);
    const items = getRuleItems();
    expect(items).toHaveLength(4);
    const passed = items.filter((item) => item.getAttribute('data-passed') === 'true');
    expect(passed).toHaveLength(4);
  });

  it('SC-POLICY-2 — all-fail: renders 4 rules, all in failing state (empty string)', () => {
    render(<PasswordStrengthMeter password="" />);
    const items = getRuleItems();
    expect(items).toHaveLength(4);
    const failed = items.filter((item) => item.getAttribute('data-passed') === 'false');
    expect(failed).toHaveLength(4);
  });

  it('SC-POLICY-3 — partial: "Abc1234" (fails length) → 3 pass, 1 fail', () => {
    render(<PasswordStrengthMeter password="Abc1234" />);
    const items = getRuleItems();
    expect(items).toHaveLength(4);
    const passed = items.filter((item) => item.getAttribute('data-passed') === 'true');
    const failed = items.filter((item) => item.getAttribute('data-passed') === 'false');
    expect(passed).toHaveLength(3);
    expect(failed).toHaveLength(1);
  });

  it('length rule item is the one that fails for "Abc1234"', () => {
    render(<PasswordStrengthMeter password="Abc1234" />);
    const failedItem = screen
      .getAllByRole('listitem')
      .find((item) => item.getAttribute('data-passed') === 'false');
    expect(failedItem).toBeDefined();
    expect(failedItem?.getAttribute('data-rule-id')).toBe('length');
  });

  it('renders human-readable label text for each rule', () => {
    render(<PasswordStrengthMeter password="" />);
    expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/lowercase/i)).toBeInTheDocument();
    expect(screen.getByText(/uppercase/i)).toBeInTheDocument();
    expect(screen.getByText(/number|digit/i)).toBeInTheDocument();
  });

  it('passing rule has success styling class', () => {
    render(<PasswordStrengthMeter password="Abc12345" />);
    const passedItems = screen
      .getAllByRole('listitem')
      .filter((item) => item.getAttribute('data-passed') === 'true');
    passedItems.forEach((item) => {
      expect(item.className).toMatch(/success/);
    });
  });

  it('failing rule has error styling class', () => {
    render(<PasswordStrengthMeter password="" />);
    const failedItems = screen
      .getAllByRole('listitem')
      .filter((item) => item.getAttribute('data-passed') === 'false');
    failedItems.forEach((item) => {
      expect(item.className).toMatch(/error/);
    });
  });
});
