/** Logarithmic spiral arms around the origin, out to a radius of 100. */
export function spiralArms(count = 6, growth = 0.3, start = 2): string[] {
	const end = Math.log(100 / start) / growth;
	return Array.from({ length: count }, (_, arm) => {
		const turn = (arm / count) * Math.PI * 2;
		const points: string[] = [];
		for (let theta = 0; theta <= end; theta += 0.05) {
			const r = start * Math.exp(growth * theta);
			points.push(`${(r * Math.cos(theta + turn)).toFixed(1)} ${(r * Math.sin(theta + turn)).toFixed(1)}`);
		}
		return `M${points.join('L')}`;
	});
}
