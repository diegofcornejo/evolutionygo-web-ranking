import { clothInk, optionHex, outfitCarriesLogo, sanitizeAvatar, type AvatarConfig } from './options';

const LINE = '#2a1f1d';
const LEFT_EYE = 53;
const RIGHT_EYE = 75;
const EYE_Y = 58;

const mix = (hex: string, target: number, amount: number) => {
	const value = Number.parseInt(hex.slice(1), 16);
	const channel = (shift: number) => {
		const c = (value >> shift) & 255;
		return Math.round(c + (target - c) * amount);
	};
	return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`;
};
const darken = (hex: string, amount = 0.25) => mix(hex, 0, amount);
const lighten = (hex: string, amount = 0.25) => mix(hex, 255, amount);

const layer = (name: string, content: string, attrs = '') => `<g data-layer="${name}"${attrs}>${content}</g>`;

// Redraws every solid shape of a part with a gradient on top, so flat parts read as lit from the upper left.
const SOLID = /<(path|circle|ellipse|rect|polygon)\b[^>]*fill="#[0-9a-f]{6}"[^>]*\/>/g;
const shade = (markup: string, gradient: string) =>
	(markup.match(SOLID) ?? [])
		.filter((element) => !element.includes('opacity') && !/<circle[^>]*\br="\d(\.\d+)?"/.test(element))
		.map((element) =>
			element.replace(/fill="#[0-9a-f]{6}"/, `fill="url(#${gradient})"`).replace(/\sstroke(-[a-z]+)?="[^"]*"/g, ''),
		)
		.join('');
const shaded = (markup: string, gradient = 'av-sheen') => markup + shade(markup, gradient);
const mirror = (markup: string) => `<g transform="translate(128 0) scale(-1 1)">${markup}</g>`;

const STEEL = '#a9b2bd';
const STEEL_DARK = '#59626e';
const STEEL_LIGHT = '#e4e9ef';
const GOLD = '#e3b34a';
const BONE = '#e9e1c9';

// Hats that sit on the scalp hide the hair above this line.
const HAT_LINE: Partial<Record<AvatarConfig['headwear'], number>> = {
	cap: 43,
	beanie: 45,
	wizard: 44,
	tophat: 40,
	helmet: 49,
	hood: 40,
	witch: 44,
};

const LONG_BACK = (c: string) =>
	`<path fill="${c}" d="M37 58C35 32 49 21 64 21S93 32 91 58L95 106C87 111 79 108 76 100H52C49 108 41 111 33 106Z"/>`;

const HAIR_BACK: Partial<Record<AvatarConfig['hairStyle'], (c: string) => string>> = {
	long: LONG_BACK,
	centerpart: LONG_BACK,
	afro: (c) => `<circle cx="64" cy="47" r="31" fill="${c}"/>`,
	pigtails: (c) =>
		`<path fill="${c}" d="M44 38C25 37 19 64 27 92C29 78 33 66 42 58Z"/><path fill="${c}" d="M84 38C103 37 109 64 101 92C99 78 95 66 86 58Z"/>` +
		`<circle cx="40" cy="42" r="3.4" fill="${darken(c, 0.35)}"/><circle cx="88" cy="42" r="3.4" fill="${darken(c, 0.35)}"/>`,
	bob: (c) => `<path fill="${c}" d="M36 58C34 32 49 22 64 22S94 32 92 58L93 83C87 87 81 85 79 80H49C47 85 41 87 35 83Z"/>`,
	curly: (c) =>
		[
			[37, 62, 8],
			[91, 62, 8],
			[37, 72, 6.5],
			[91, 72, 6.5],
		]
			.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`)
			.join(''),
	ponytail: (c) =>
		`<path fill="${c}" d="M83 42C99 42 104 64 98 92C95 80 92 70 85 62Z"/><circle cx="89" cy="47" r="3.4" fill="${darken(c, 0.35)}"/>`,
};

const SHORT_FRONT = (c: string) =>
	`<path fill="${c}" d="M38.5 60C36 38 48 25 64 25S92 38 89.5 60C88 50 85 44 80 41C72 45 56 45 47 41C43 44 40 50 38.5 60Z"/>`;

const HAIR_FRONT: Partial<Record<AvatarConfig['hairStyle'], (c: string) => string>> = {
	short: SHORT_FRONT,
	ponytail: SHORT_FRONT,
	pigtails: SHORT_FRONT,
	bun: (c) => `<circle cx="64" cy="22" r="9.5" fill="${c}"/><path d="M56 27Q64 31 72 27" stroke="${darken(c, 0.3)}" stroke-width="1.6" fill="none"/>` + SHORT_FRONT(c),
	buzz: (c) => `<path fill="${c}" d="M39 54C38 37 50 28 64 28S90 37 89 54C86 45 78 41 64 41S42 45 39 54Z"/>`,
	slick: (c) =>
		`<path fill="${c}" d="M39 57C37 36 49 25 64 25S91 36 89 57C87 47 83 41 76 38.5C68 36.5 58 36.5 51 38.5C45 41 41 47 39 57Z"/>` +
		`<path d="M50 31Q62 27 76 31M47 35Q62 31 80 35" stroke="${lighten(c, 0.3)}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>`,
	sidepart: (c) =>
		`<path fill="${c}" d="M38 62C35 36 48 24 65 24C82 24 93 37 90 60C88 50 85 45 80 42C70 52 54 54 42 52C40 55 39 58 38 62Z"/>` +
		`<path d="M70 26Q64 34 56 38" stroke="${darken(c, 0.25)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
	messy: (c) =>
		`<path fill="${c}" d="M38 62C34 42 40 30 47 27L49 21L55 25L59 19L64 24L69 19L73 25L79 22L81 28C88 32 93 44 90 62L87 50L83 55L79 45L73 52L67 43L61 51L55 44L49 53L45 46L41 56Z"/>`,
	afro: (c) => `<path fill="${c}" d="M39 52C39 36 50 31 64 31S89 36 89 52C84 43 76 40 64 40S44 43 39 52Z"/>`,
	centerpart: (c) =>
		`<path fill="${c}" d="M38 66C35 40 46 25 64 25S93 40 90 66L91 85C87 81 86 73 86 62C85 48 76 38 64 33C52 38 43 48 42 62C42 73 41 81 37 85Z"/>`,
	spiky: (c) =>
		`<path fill="${c}" d="M38 62L30 48L40 44L33 30L48 34L49 17L60 28L66 11L72 28L83 16L82 32L97 28L88 44L98 48L90 62C88 50 84 44 78 42L72 47L66 41L58 47L52 41C45 45 40 52 38 62Z"/>`,
	long: (c) =>
		`<path fill="${c}" d="M38 66C35 40 46 25 64 25S93 40 90 66L91 85C87 81 86 73 86 62C84 50 79 44 72 40C64 46 52 48 44 46C42 52 42 58 42 64C42 72 41 80 37 85Z"/>`,
	bob: (c) =>
		`<path fill="${c}" d="M38 62C36 38 48 25 64 25S92 38 90 62L90 81C87 77 86 69 86 58V46C78 43 50 43 42 46V58C42 69 41 77 38 81Z"/>`,
	curly: (c) =>
		[
			[39, 52, 7],
			[40, 42, 8],
			[47, 33, 8],
			[56, 27.5, 8],
			[66, 26, 8],
			[76, 27.5, 8],
			[84, 33, 8],
			[89, 42, 8],
			[89, 52, 7],
		]
			.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`)
			.join(''),
	mohawk: (c) =>
		`<path fill="${c}" opacity=".35" d="M39 54C38 38 50 30 64 30S90 38 89 54C86 44 78 40 64 40S42 44 39 54Z"/><path fill="${c}" d="M57 42C54 30 56 18 64 7C72 18 74 30 71 42C68 39 60 39 57 42Z"/>`,
};

const EYE_WHITE = '#ffffff';

const roundEye = (x: number, iris: string) =>
	`<ellipse cx="${x}" cy="${EYE_Y}" rx="4.8" ry="5.2" fill="${EYE_WHITE}"/>` +
	`<circle cx="${x}" cy="${EYE_Y + 0.6}" r="3.3" fill="${iris}"/>` +
	`<circle cx="${x}" cy="${EYE_Y + 0.6}" r="1.6" fill="${LINE}"/>` +
	`<circle cx="${x + 1.2}" cy="${EYE_Y - 0.8}" r="1" fill="#fff"/>`;

const bigEye = (x: number, iris: string) =>
	`<ellipse cx="${x}" cy="${EYE_Y - 0.5}" rx="5.4" ry="6.6" fill="${EYE_WHITE}"/>` +
	`<ellipse cx="${x}" cy="${EYE_Y}" rx="4" ry="5.2" fill="${iris}"/>` +
	`<ellipse cx="${x}" cy="${EYE_Y + 0.4}" rx="1.9" ry="2.7" fill="${LINE}"/>` +
	`<circle cx="${x + 1.5}" cy="${EYE_Y - 2}" r="1.5" fill="#fff"/>` +
	`<circle cx="${x - 1.4}" cy="${EYE_Y + 2.2}" r=".7" fill="#fff"/>` +
	`<path d="M${x - 5.8} ${EYE_Y - 2.5}Q${x} ${EYE_Y - 9.5} ${x + 5.8} ${EYE_Y - 2.5}" stroke="${LINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

// side = -1 for the left eye, 1 for the right eye; the outer corner lifts.
const sharpEye = (x: number, iris: string, side: number) => {
	const outer = x + 6 * side;
	const inner = x - 6 * side;
	const lid = `M${inner} ${EYE_Y + 1}Q${x} ${EYE_Y - 6} ${outer} ${EYE_Y - 1.5}`;
	return (
		`<path d="${lid}Q${x} ${EYE_Y + 4.5} ${inner} ${EYE_Y + 1}Z" fill="${EYE_WHITE}"/>` +
		`<circle cx="${x}" cy="${EYE_Y}" r="2.8" fill="${iris}"/>` +
		`<circle cx="${x}" cy="${EYE_Y}" r="1.4" fill="${LINE}"/>` +
		`<path d="${lid}" stroke="${LINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
	);
};

const sleepyEye = (x: number, iris: string, skin: string) =>
	roundEye(x, iris) +
	`<rect x="${x - 6}" y="${EYE_Y - 7}" width="12" height="7" fill="${skin}"/>` +
	`<path d="M${x - 5.2} ${EYE_Y}Q${x} ${EYE_Y + 1.2} ${x + 5.2} ${EYE_Y}" stroke="${LINE}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;

const closedEye = (x: number) =>
	`<path d="M${x - 5} ${EYE_Y + 1.5}Q${x} ${EYE_Y - 4.5} ${x + 5} ${EYE_Y + 1.5}" stroke="${LINE}" stroke-width="2" fill="none" stroke-linecap="round"/>`;

const EYES: Record<AvatarConfig['eyeStyle'], (iris: string, skin: string) => string> = {
	round: (iris) => roundEye(LEFT_EYE, iris) + roundEye(RIGHT_EYE, iris),
	big: (iris) => bigEye(LEFT_EYE, iris) + bigEye(RIGHT_EYE, iris),
	sharp: (iris) => sharpEye(LEFT_EYE, iris, -1) + sharpEye(RIGHT_EYE, iris, 1),
	sleepy: (iris, skin) => sleepyEye(LEFT_EYE, iris, skin) + sleepyEye(RIGHT_EYE, iris, skin),
	happy: () => closedEye(LEFT_EYE) + closedEye(RIGHT_EYE),
	wink: (iris) => roundEye(LEFT_EYE, iris) + closedEye(RIGHT_EYE),
};

const temples = `<path d="M46 56.5L39.5 55M82 56.5L88.5 55" stroke="${LINE}" stroke-width="1.8" stroke-linecap="round"/>`;

const EYEWEAR: Partial<Record<AvatarConfig['eyewear'], string>> = {
	round:
		temples +
		[LEFT_EYE, RIGHT_EYE]
			.map((x) => `<circle cx="${x}" cy="${EYE_Y}" r="7.2" fill="#fff" fill-opacity=".14" stroke="${LINE}" stroke-width="2"/>`)
			.join('') +
		`<path d="M60.2 57.5Q64 54.5 67.8 57.5" stroke="${LINE}" stroke-width="2" fill="none"/>`,
	square:
		temples +
		[LEFT_EYE, RIGHT_EYE]
			.map(
				(x) =>
					`<rect x="${x - 7.6}" y="${EYE_Y - 6}" width="15.2" height="12" rx="2.6" fill="#fff" fill-opacity=".14" stroke="${LINE}" stroke-width="2"/>`,
			)
			.join('') +
		`<path d="M60.6 56.5H67.4" stroke="${LINE}" stroke-width="2"/>`,
	sunglasses:
		temples +
		[LEFT_EYE, RIGHT_EYE]
			.map(
				(x) =>
					`<path d="M${x - 8} ${EYE_Y - 5}H${x + 8}V${EYE_Y}C${x + 8} ${EYE_Y + 5} ${x + 4} ${EYE_Y + 7} ${x} ${EYE_Y + 7}S${x - 8} ${EYE_Y + 5} ${x - 8} ${EYE_Y}Z" fill="#15161a"/>` +
					`<path d="M${x - 5} ${EYE_Y - 2.5}L${x - 1} ${EYE_Y - 2.5}" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/>`,
			)
			.join('') +
		`<path d="M61 54H67" stroke="#15161a" stroke-width="2.4"/>`,
	monocle:
		`<circle cx="${RIGHT_EYE}" cy="${EYE_Y}" r="7.6" fill="#fff" fill-opacity=".14" stroke="#c9a227" stroke-width="2.2"/>` +
		`<path d="M81 63C86 72 84 84 90 96" stroke="#c9a227" stroke-width="1.2" fill="none" stroke-dasharray="2 1.6"/>`,
};

const star = (cx: number, cy: number, outer: number, inner: number, fill: string) => {
	const points = Array.from({ length: 10 }, (_, i) => {
		const r = i % 2 === 0 ? outer : inner;
		const angle = (Math.PI / 5) * i - Math.PI / 2;
		return `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;
	});
	return `<polygon points="${points.join(' ')}" fill="${fill}"/>`;
};

const HEADWEAR: Partial<Record<AvatarConfig['headwear'], (c: string) => string>> = {
	cap: (c) =>
		`<path fill="${c}" d="M37 46C37 26 49 17 64 17S91 26 91 46Z"/>` +
		`<path fill="${darken(c, 0.15)}" d="M64 17C58 24 56 34 56 46H60C60 34 61 24 64 17ZM64 17C70 24 72 34 72 46H68C68 34 67 24 64 17Z" opacity=".5"/>` +
		`<path fill="${darken(c)}" d="M34 45Q64 37 94 45Q98 50 94 53Q64 46 34 53Q30 50 34 45Z"/>` +
		`<circle cx="64" cy="17.5" r="2.4" fill="${darken(c)}"/>`,
	beanie: (c) =>
		`<path fill="${c}" d="M37 50C35 26 48 15 64 15S93 26 91 50Z"/>` +
		`<path stroke="${darken(c, 0.15)}" stroke-width="1.4" d="M50 20V44M57 17V44M64 16V44M71 17V44M78 20V44" opacity=".6"/>` +
		`<rect x="34.5" y="41" width="59" height="11" rx="5.5" fill="${darken(c, 0.2)}"/>` +
		`<circle cx="64" cy="13" r="5.5" fill="${lighten(c, 0.35)}"/>`,
	headband: (c) =>
		`<path fill="${c}" d="M38.5 41Q64 33 89.5 41L90 48Q64 40 38 48Z"/>` +
		`<path fill="${darken(c)}" d="M88 42L97 37L96 45ZM88 45L98 47L92 52Z"/>`,
	wizard: (c) =>
		`<path fill="${c}" d="M35 46C45 34 55 12 80 1C73 16 77 32 93 46Z"/>` +
		`<ellipse cx="64" cy="46" rx="34" ry="6.5" fill="${darken(c)}"/>` +
		star(62, 30, 4.2, 1.8, '#f6d55c') +
		star(72, 16, 2.8, 1.2, '#f6d55c') +
		star(52, 40, 2.4, 1, '#f6d55c'),
	tophat: (c) =>
		`<rect x="45" y="5" width="38" height="36" rx="3" fill="#202228"/>` +
		`<rect x="45" y="30" width="38" height="6" fill="${c}"/>` +
		`<ellipse cx="64" cy="41" rx="31" ry="5.5" fill="#17181d"/>`,
	crown: () =>
		`<path fill="#f2c230" stroke="#b9871a" stroke-width="1.4" stroke-linejoin="round" d="M42 37L43 17L53 27L64 11L75 27L85 17L86 37Z"/>` +
		`<circle cx="64" cy="29" r="2.6" fill="#d63a3a"/><circle cx="52" cy="32" r="1.8" fill="#2f6fd6"/><circle cx="76" cy="32" r="1.8" fill="#2f6fd6"/>`,
	helmet: (c) =>
		`<path fill="${c}" d="M64 19C68 7 82 1 98 6C88 8 79 13 73 22Z"/><path fill="${darken(c, 0.2)}" d="M73 22C79 14 88 10 96 9C88 13 81 17 77 23Z"/>` +
		`<path fill="${STEEL}" d="M37 51C36 28 48 17 64 17S92 28 91 51Z"/>` +
		`<path fill="${STEEL}" d="M37 49L36 70Q40 77 46 75L45 51Z"/>` +
		mirror(`<path fill="${STEEL}" d="M37 49L36 70Q40 77 46 75L45 51Z"/>`) +
		`<path fill="${STEEL_DARK}" d="M36 46Q64 39 92 46L92 52Q64 45 36 52Z"/>` +
		`<rect x="61.8" y="46" width="4.4" height="19" rx="1.6" fill="${STEEL}"/>` +
		`<path d="M64 18V44" stroke="${STEEL_LIGHT}" stroke-width="2" stroke-linecap="round"/>` +
		[40, 48, 80, 88].map((x) => `<circle cx="${x}" cy="49" r="1.1" fill="${STEEL_LIGHT}"/>`).join(''),
	hood: (c) =>
		`<path fill="${c}" fill-rule="evenodd" d="M30 96C25 62 36 24 64 18C92 24 103 62 98 96L85 99C89 72 85 44 64 37C43 44 39 72 43 99Z"/>` +
		`<path d="M43 99C39 72 43 44 64 37C85 44 89 72 85 99" stroke="${darken(c, 0.45)}" stroke-width="2.6" fill="none"/>`,
	witch: (c) =>
		`<ellipse cx="64" cy="45" rx="41" ry="7.5" fill="${darken(c, 0.15)}"/>` +
		`<path fill="${c}" d="M42 45C46 31 50 17 59 9C66 3 77 0 88 5C79 6 73 12 71 21C77 29 83 37 86 45Z"/>` +
		`<path fill="#6b3fa0" d="M43 40Q64 45 85 40L86 45Q64 50 42 45Z"/>` +
		`<rect x="59.5" y="39" width="9" height="8" rx="1.2" fill="none" stroke="${GOLD}" stroke-width="1.8"/>`,
};

// Drawn behind the head: the part of a hood that hangs at the back.
const HEADWEAR_BACK: Partial<Record<AvatarConfig['headwear'], (c: string) => string>> = {
	hood: (c) => `<path fill="${darken(c, 0.35)}" d="M28 104C22 66 34 24 64 18C94 24 106 66 100 104Z"/>`,
};

// The Evolution favicon emblem (public/favicon.svg), recentred on its own middle so it can be scaled onto the shirt.
const EVOLUTION_EMBLEM =
	'<path d="M118.333 63.187L218.359 62.784L164.58 177.02L64.452 177.02ZM211.731 67.703L120.32 68.071L71.079 172.101L162.584 172.101Z"/>' +
	'<path d="M122.719 73.97L203.728 73.644L160.174 166.161L79.083 166.161ZM199.047 77.118L124.123 77.42L83.763 162.687L158.765 162.687Z"/>' +
	'<path d="M125.811 81.57L193.416 81.297L157.069 158.507L89.394 158.507ZM147.85 90.308C142.995 91.853 137.591 95.906 132.587 102.218C121.846 115.794 116.987 134.71 121.755 144.489C124.331 149.719 129.142 151.267 134.711 149.495C139.551 147.955 144.963 143.899 149.972 137.578C160.761 123.995 165.569 105.078 160.788 95.311C158.212 90.081 153.404 88.54 147.85 90.308Z"/>' +
	'<polygon points="33.594,68.009 31.113,62.784 113.308,62.784 114.262,64.703 111.592,70.349 110.291,67.654 38.817,67.654 75.998,145.936 73.195,151.385 35.907,72.878 30.328,72.878 70.418,157.285 67.762,162.948 27.299,77.84 22.345,77.84 65.261,168.232 62.591,173.874 14.641,72.97 24.984,72.97 22.625,68.009"/>';

const LOGOS: Partial<Record<AvatarConfig['shirtLogo'], (ink: string) => string>> = {
	evolution: (ink) => `<g fill="${ink}" transform="translate(64 113) scale(.115) translate(-116.5 -119.9)">${EVOLUTION_EMBLEM}</g>`,
	evo: (ink) =>
		`<text x="64" y="118" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="800" letter-spacing=".5" text-anchor="middle">EVO</text>`,
	star: (ink) => star(64, 113, 7, 3, ink),
	bolt: (ink) => `<path fill="${ink}" d="M66 103L57 115H63L60 124L71 111H65L68 103Z"/>`,
	heart: (ink) =>
		`<path fill="${ink}" d="M64 121C56 115 54.5 109 58.5 107C61.5 105.6 63.4 107.5 64 109C64.6 107.5 66.5 105.6 69.5 107C73.5 109 72 115 64 121Z"/>`,
	flame: (ink) =>
		`<path fill="${ink}" d="M64 123C57 123 55.5 116 58.5 111.5C59.5 114.5 61.5 114.5 61.8 112.5C62 108 64 105 66.5 102.5C66.5 107 71.5 109.5 71.5 115.5C71.5 120 68.5 123 64 123Z"/>`,
	card: (ink) =>
		`<rect x="58" y="103" width="12" height="17" rx="1.6" fill="none" stroke="${ink}" stroke-width="1.6"/>` +
		`<rect x="60.3" y="106" width="7.4" height="6.4" fill="${ink}"/>` +
		`<path d="M60.3 114.8H67.7M60.3 117.3H65.5" stroke="${ink}" stroke-width="1"/>`,
};

const TORSO = 'M10 128C12 108 30 99 54 96H74C98 99 116 108 118 128Z';

const pauldron = `<path fill="${STEEL}" d="M7 124C4 105 17 96 35 96.5C44 97 49 103 48 112C38 107 21 110 7 124Z"/>` +
	`<path d="M12 113Q25 104 42 105M9 120Q22 111 40 111" stroke="${STEEL_DARK}" stroke-width="1.3" fill="none"/>` +
	`<circle cx="36" cy="101" r="1.3" fill="${STEEL_LIGHT}"/>`;

const skull = (x: number, y: number) =>
	`<circle cx="${x}" cy="${y}" r="7" fill="${BONE}"/><rect x="${x - 4}" y="${y + 3}" width="8" height="6" rx="2" fill="${BONE}"/>` +
	`<circle cx="${x - 2.6}" cy="${y}" r="2" fill="#16130f"/><circle cx="${x + 2.6}" cy="${y}" r="2" fill="#16130f"/>` +
	`<path d="M${x - 2} ${y + 6}V${y + 9}M${x} ${y + 6}V${y + 9}M${x + 2} ${y + 6}V${y + 9}" stroke="#16130f" stroke-width=".8"/>`;

// Outfits get the shirt colour as their cloth; skin is passed for open necklines.
const OUTFITS: Record<AvatarConfig['outfit'], (c: string, skin: string) => string> = {
	tshirt: (c, skin) =>
		`<path fill="${c}" d="${TORSO}"/>` +
		`<path fill="${skin}" d="M54 96Q64 104 74 96Z"/>` +
		`<path d="M52 96Q64 105 76 96" stroke="${darken(c, 0.2)}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
	knight: (c) =>
		`<path fill="${STEEL}" d="${TORSO}"/>` +
		`<path fill="${c}" d="M45 128L49 101H79L83 128Z"/>` +
		`<path d="M49 101L45 128M79 101L83 128" stroke="${GOLD}" stroke-width="1.8"/>` +
		`<path fill="${STEEL}" d="M49 91Q64 99 79 91L81 101Q64 110 47 101Z"/>` +
		`<path d="M48 96Q64 104 80 96" stroke="${STEEL_DARK}" stroke-width="1.2" fill="none"/>` +
		pauldron +
		mirror(pauldron),
	mage: (c) => {
		const flap = `<path fill="${darken(c, 0.25)}" d="M55 97C45 92 40 82 41 72C48 77 53 85 57 94Z"/><path d="M41 72C40 82 45 92 55 97" stroke="${GOLD}" stroke-width="1.6" fill="none"/>`;
		return (
			flap +
			mirror(flap) +
			`<path fill="${c}" d="${TORSO}"/>` +
			`<path fill="${darken(c, 0.4)}" d="M52 96.5L64 127L76 96.5Z"/>` +
			`<path d="M52 96.5L64 127L76 96.5" stroke="${GOLD}" stroke-width="2.4" fill="none" stroke-linejoin="round"/>` +
			`<path fill="#7de0ff" stroke="${GOLD}" stroke-width="1.4" d="M64 99L68 104L64 109L60 104Z"/>` +
			star(30, 112, 2.6, 1.1, GOLD) +
			star(98, 112, 2.6, 1.1, GOLD)
		);
	},
	vampire: (c) => {
		const collar =
			`<path fill="#1d1922" d="M50 97C36 89 28 72 30 52C39 62 48 78 57 95Z"/>` +
			`<path fill="${c}" d="M51 95C40 88 34 74 34 60C41 69 48 81 55 93Z"/>`;
		return (
			collar +
			mirror(collar) +
			`<path fill="#1d1922" d="${TORSO}"/>` +
			`<path d="M55 97L61 128M73 97L67 128" stroke="#3a3340" stroke-width="2"/>` +
			`<path fill="#f1ede4" d="M57 95Q64 100 71 95L73 105Q64 112 55 105Z"/>` +
			`<path d="M58 101Q64 105 70 101M57 105Q64 109 71 105" stroke="#c9c2b4" stroke-width="1" fill="none"/>` +
			`<circle cx="64" cy="99" r="2.6" fill="${c}" stroke="${GOLD}" stroke-width="1"/>`
		);
	},
	necromancer: (c) => {
		const robe = mix(c, 0, 0.6);
		return (
			`<path fill="${robe}" d="${TORSO}"/>` +
			`<path fill="${mix(c, 0, 0.75)}" d="M52 96Q64 106 76 96L72 128H56Z"/>` +
			`<path d="M42 106Q64 118 86 106" stroke="${BONE}" stroke-width="1.8" stroke-dasharray="3 2" fill="none"/>` +
			skull(25, 106) +
			skull(103, 106) +
			`<circle cx="64" cy="114" r="4" fill="none" stroke="${BONE}" stroke-width="1.6"/>`
		);
	},
	rogue: (c) =>
		`<path fill="#6b4a33" d="${TORSO}"/>` +
		`<path d="M30 102L98 128" stroke="#3e2a1c" stroke-width="6"/>` +
		`<rect x="58" y="110" width="9" height="8" rx="1.2" fill="none" stroke="${GOLD}" stroke-width="1.8" transform="rotate(21 62.5 114)"/>` +
		`<path fill="${c}" d="M47 93Q64 108 81 93L85 104Q64 119 43 104Z"/>` +
		`<path d="M48 99Q64 111 80 99" stroke="${darken(c, 0.25)}" stroke-width="1.2" fill="none"/>`,
};

const stars = (points: number[][], fill = '#fff') =>
	points.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity=".7"/>`).join('');

const tower = (x: number, w: number, top: number, fill: string) =>
	`<rect x="${x}" y="${top}" width="${w}" height="${128 - top}" fill="${fill}"/><path fill="${fill}" d="M${x - 2} ${top}L${x + w / 2} ${top - w * 1.1}L${x + w + 2} ${top}Z"/>` +
	`<rect x="${x + w / 2 - 1.2}" y="${top + 8}" width="2.4" height="4" rx="1.2" fill="#ffcf5a"/>`;

const candle = (x: number, y: number) =>
	`<circle cx="${x}" cy="${y - 4}" r="7" fill="#ffb347" opacity=".22"/>` +
	`<rect x="${x - 2.5}" y="${y}" width="5" height="14" rx="1" fill="#efe3c4"/>` +
	`<path fill="#ffcf5a" d="M${x} ${y - 7}C${x + 3} ${y - 3} ${x + 2} ${y} ${x} ${y}S${x - 3} ${y - 3} ${x} ${y - 7}Z"/>`;

const books = (x: number, y: number, flip: boolean) =>
	['#7a2e2e', '#2e4f7a', '#6b5a2a', '#3d6b3d', '#5a2e6b']
		.map((fill, i) => `<rect x="${flip ? x - (i + 1) * 4.2 : x + i * 4.2}" y="${y - 10 - (i % 3) * 2}" width="3.6" height="${10 + (i % 3) * 2}" fill="${fill}"/>`)
		.join('');

// Scenery painted over the background gradient; the bust covers the middle.
const SCENES: Partial<Record<AvatarConfig['background'], string>> = {
	moon:
		stars([[14, 18, 0.8], [30, 40, 0.6], [22, 70, 0.7], [110, 70, 0.6], [60, 10, 0.6]]) +
		`<circle cx="95" cy="29" r="24" fill="#fff6d6" opacity=".1"/><circle cx="95" cy="29" r="15" fill="#f3ebc6"/>` +
		`<circle cx="90" cy="25" r="3" fill="#d9cf9f"/><circle cx="99" cy="34" r="2.2" fill="#d9cf9f"/>`,
	graveyard:
		`<circle cx="26" cy="24" r="9" fill="#e4f5e0" opacity=".85"/>` +
		`<path d="M8 128V62M8 74L-2 66M8 70L18 58M18 58L24 56M8 86L16 80" stroke="#0c1611" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
		`<path fill="#0f1d17" d="M0 104V88Q0 80 8 80Q16 80 16 88V104Z"/>` +
		`<path fill="#0f1d17" d="M110 104V84H105V79H110V73H114V79H119V84H114V104Z"/>` +
		`<ellipse cx="64" cy="104" rx="80" ry="10" fill="#9ff0c0" opacity=".14"/>`,
	castle:
		stars([[20, 14, 0.7], [44, 24, 0.5], [104, 16, 0.7], [88, 8, 0.5]]) +
		tower(4, 13, 52, '#150f26') +
		tower(20, 9, 70, '#150f26') +
		tower(111, 13, 52, '#150f26') +
		tower(99, 9, 70, '#150f26'),
	library:
		[30, 62, 94].map((y) => `<rect x="0" y="${y}" width="128" height="3" fill="#2a180d"/>`).join('') +
		books(2, 30, false) +
		books(126, 30, true) +
		books(4, 62, false) +
		books(124, 62, true) +
		candle(18, 78) +
		candle(110, 78),
	arcane:
		`<g fill="none" stroke="#c9a4ff" opacity=".55"><circle cx="64" cy="60" r="50" stroke-width="1.4"/><circle cx="64" cy="60" r="43" stroke-width=".8"/>` +
		Array.from({ length: 16 }, (_, i) => {
			const a = (Math.PI / 8) * i;
			return `<path d="M${(64 + 43 * Math.cos(a)).toFixed(1)} ${(60 + 43 * Math.sin(a)).toFixed(1)}L${(64 + 50 * Math.cos(a)).toFixed(1)} ${(60 + 50 * Math.sin(a)).toFixed(1)}"/>`;
		}).join('') +
		`<path d="M64 10L107 85H21Z" stroke-width=".8"/><path d="M64 110L21 35H107Z" stroke-width=".8"/></g>`,
};

const face = (skinShade: string) =>
	`<path d="M64 61.5Q61.4 66.6 64.6 67.6" stroke="${skinShade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
	`<ellipse cx="47.5" cy="68.5" rx="4" ry="2.4" fill="#f08a8a" opacity=".35"/>` +
	`<ellipse cx="80.5" cy="68.5" rx="4" ry="2.4" fill="#f08a8a" opacity=".35"/>` +
	`<path d="M57.5 72.5Q64 78.5 70.5 72.5" stroke="#8c4436" stroke-width="2" fill="none" stroke-linecap="round"/>`;

export const renderAvatarSvg = (input: AvatarConfig): string => {
	const config = sanitizeAvatar(input);
	const skin = optionHex('skinTone', config.skinTone);
	const skinShade = darken(skin, 0.1);
	const hair = optionHex('hairColor', config.hairColor);
	const shirt = optionHex('shirtColor', config.shirtColor);
	const hat = optionHex('headwearColor', config.headwearColor);
	const bg = optionHex('background', config.background);
	const magicHex = optionHex('magicColor', config.magicColor);
	const aura = config.magic === 'aura' || config.magic === 'both';
	const glowingEyes = config.magic === 'eyes' || config.magic === 'both';
	const brows = config.hairStyle === 'bald' ? '#4a2f22' : darken(hair, 0.15);
	const hatLine = HAT_LINE[config.headwear];
	const clip = hatLine === undefined ? '' : ' clip-path="url(#av-hat)"';
	const hairLayer = `hair-${config.hairStyle}`;

	const back = config.headwear === 'hood' ? undefined : HAIR_BACK[config.hairStyle];
	const front = HAIR_FRONT[config.hairStyle];
	const logo = outfitCarriesLogo(config.outfit) ? LOGOS[config.shirtLogo] : undefined;
	const eyewear = EYEWEAR[config.eyewear];
	const headwear = HEADWEAR[config.headwear];
	const headwearBack = HEADWEAR_BACK[config.headwear];
	const scene = SCENES[config.background];
	const head = '<ellipse cx="64" cy="56" rx="25" ry="28"/>';

	const defs =
		'<defs>' +
		`<radialGradient id="av-bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${lighten(bg, 0.16)}"/><stop offset=".5" stop-color="${bg}"/><stop offset="1" stop-color="${darken(bg, 0.5)}"/></radialGradient>` +
		'<linearGradient id="av-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>' +
		'<radialGradient id="av-cloth" gradientUnits="userSpaceOnUse" cx="52" cy="100" r="72"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>' +
		'<radialGradient id="av-skin" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>' +
		'<radialGradient id="av-vignette" cx=".5" cy=".45" r=".72"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>' +
		(aura
			? `<radialGradient id="av-aura" gradientUnits="userSpaceOnUse" cx="64" cy="64" r="62"><stop offset=".25" stop-color="${magicHex}" stop-opacity=".75"/><stop offset=".6" stop-color="${magicHex}" stop-opacity=".22"/><stop offset="1" stop-color="${magicHex}" stop-opacity="0"/></radialGradient>`
			: '') +
		(glowingEyes ? '<filter id="av-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2"/></filter>' : '') +
		(hatLine === undefined ? '' : `<clipPath id="av-hat"><rect x="0" y="${hatLine}" width="128" height="${128 - hatLine}"/></clipPath>`) +
		'</defs>';

	return [
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">',
		defs,
		'<rect width="128" height="128" fill="url(#av-bg)"/>',
		scene ? layer(`scene-${config.background}`, scene) : '',
		aura
			? layer(
					'aura',
					'<circle cx="64" cy="64" r="62" fill="url(#av-aura)"/>' +
						stars([[22, 40, 1.4], [104, 34, 1.2], [16, 76, 1], [112, 82, 1.4], [34, 18, 1], [96, 60, 0.9]], lighten(magicHex, 0.5)),
				)
			: '',
		headwearBack ? layer(`headwear-${config.headwear}-back`, headwearBack(hat)) : '',
		back ? layer(`${hairLayer}-back`, shaded(back(hair)), clip) : '',
		layer(`outfit-${config.outfit}`, shaded(OUTFITS[config.outfit](shirt, skin), 'av-cloth')),
		// Logos are drawn around (64, 113); this moves them onto the chest, clear of the collar.
		logo
			? layer(
					`logo-${config.shirtLogo}`,
					logo(config.outfit === 'knight' ? GOLD : clothInk(config.shirtColor)),
					' transform="translate(64 116.5) scale(.85) translate(-64 -113)"',
				)
			: '',
		layer(
			'head',
			`<rect x="55" y="72" width="18" height="27" rx="5" fill="${skin}"/>` +
				`<ellipse cx="64" cy="84" rx="9.5" ry="4.5" fill="${skinShade}"/>` +
				`<ellipse cx="39" cy="60" rx="4.5" ry="6" fill="${skin}"/><ellipse cx="89" cy="60" rx="4.5" ry="6" fill="${skin}"/>` +
				head.replace('/>', ` fill="${skin}"/>`) +
				head.replace('/>', ' fill="url(#av-skin)"/>'),
		),
		layer('face', face(skinShade)),
		layer(
			'brows',
			`<path d="M47 49Q53 45.5 58.5 48.2M69.5 48.2Q75 45.5 81 49" stroke="${brows}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
		),
		layer(`eyes-${config.eyeStyle}`, EYES[config.eyeStyle](optionHex('eyeColor', config.eyeColor), skin)),
		glowingEyes
			? layer(
					'glow',
					[LEFT_EYE, RIGHT_EYE]
						.map(
							(x) =>
								`<circle cx="${x}" cy="${EYE_Y}" r="5" fill="${magicHex}" filter="url(#av-glow)"/>` +
								`<ellipse cx="${x}" cy="${EYE_Y}" rx="3.6" ry="3" fill="${magicHex}"/><ellipse cx="${x}" cy="${EYE_Y}" rx="1.6" ry="1.2" fill="#fff"/>`,
						)
						.join(''),
				)
			: '',
		// A darker edge keeps light hair readable against light skin.
		front ? layer(hairLayer, shaded(front(hair)), `${clip} stroke="${darken(hair, 0.4)}" stroke-width=".9"`) : '',
		eyewear ? layer(`eyewear-${config.eyewear}`, eyewear) : '',
		headwear ? layer(`headwear-${config.headwear}`, shaded(headwear(hat))) : '',
		'<rect width="128" height="128" fill="url(#av-vignette)"/>',
		'</svg>',
	].join('');
};

export const avatarDataUri = (config: AvatarConfig): string =>
	`data:image/svg+xml,${encodeURIComponent(renderAvatarSvg(config))}`;
