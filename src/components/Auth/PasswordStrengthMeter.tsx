import { evaluatePassword } from '@utils/passwordPolicy';
import type { PasswordRuleId } from '@utils/passwordPolicy';

const RULE_LABELS: Record<PasswordRuleId, string> = {
	length: 'At least 8 characters',
	lowercase: 'At least one lowercase letter',
	uppercase: 'At least one uppercase letter',
	digit: 'At least one number',
};

interface Props {
	password: string;
}

export function PasswordStrengthMeter({ password }: Readonly<Props>) {
	const { rules } = evaluatePassword(password);

	return (
		<ul className="space-y-1 text-xs mt-1">
			{rules.map(({ id, passed }) => (
				<li
					key={id}
					className={passed ? 'text-success' : 'text-error'}
					data-rule-id={id}
					data-passed={String(passed)}
				>
					<span aria-hidden="true">{passed ? '✓' : '✗'}</span>{' '}
					{RULE_LABELS[id]}
				</li>
			))}
		</ul>
	);
}
