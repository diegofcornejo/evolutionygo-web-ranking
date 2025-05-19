import { useStore } from '@nanostores/react';
import { banlists } from '@stores/banlistsStore';
import type { Command } from '@types';

const getCurrentBanlist = (banlists: string[], banlist: string) => {
	const regex = new RegExp(`^(\\d{4})\\.(\\d{1,2}) ${banlist}$`);
	const matches = banlists
		.map((entry) => {
			const match = entry.match(regex);
			if (!match) return null;
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10);
			return { year, month, original: entry };
		})
		.filter(Boolean)
		.sort((a, b) => {
			if (b!.year !== a!.year) return b!.year - a!.year;
			return b!.month - a!.month;
		});

	return matches[0]?.original || '';
};


export default function CommandTable() {
	const $banlists = useStore(banlists);
	const title = 'Special Commands';
	const description = 'Use these commands to play with special formats. You can combine them with well-known commands such as M, NC, NS, S, ST, TM, and others.';
	const commands: Command[] = [
		{ code: 'TCG', description: 'Current TCG format', example: 'TCG,M#123', banlist: getCurrentBanlist($banlists, 'TCG') },
		{ code: 'OCG', description: 'Current OCG format', example: 'OCG,S#123', banlist: getCurrentBanlist($banlists, 'OCG') },
		{ code: 'PRE', description: 'Play with pre-released TCG cards', example: 'PRE,M,ST7#123' },
		{
			code: 'TCGPRE',
			description: 'Play with pre-released TCG cards',
			example: 'TCGPRE,S,TM800#123',
		},
		{
			code: 'OCGPRE',
			description: 'Play with pre-released OCG cards',
			example: 'OCGPRE,M,ST5#123',
		},
		{
			code: 'TCGART',
			description: 'Play custom cards with current TCG format',
			example: 'TCGART,S,TM800#123',
			banlist: getCurrentBanlist($banlists, 'TCG'),
		},
		{
			code: 'OCGART',
			description: 'Play custom cards with current OCG format',
			example: 'OCGART,S,TM800#123',
			banlist: getCurrentBanlist($banlists, 'OCG'),
		},
		{
			code: 'TOOT',
			description: 'Play with current TCG format and enable OCG cards',
			example: 'TOOT,M,ST7#123',
			banlist: getCurrentBanlist($banlists, 'TCG'),
		},
		{
			code: 'OTTO',
			description: 'Play with current OCG format and enable TCG cards',
			example: 'OTTO,M,ST7#123',
			banlist: getCurrentBanlist($banlists, 'OCG'),
		},
		{
			code: '⁠EDISON',
			description: 'Traditional Edison with its original erratas',
			example: 'EDISON,ST6#123',
		},
		{ code: 'GOAT', description: 'Traditional Goat', example: 'GOAT,S#123' },
		{ code: 'GX', description: 'Official GX', example: 'GX,S,TM500#123' },
		{
			code: 'MD',
			description: 'Allows playing the updated Master Duel format',
			example: 'MD,M,ST6,TM400#123',
		},
		{ code: 'HAT', description: 'Traditional Hat', example: 'HAT,S#123' },
		{ code: 'TENGU', description: 'Traditional Tengu Plant', example: 'TENGU,M#123' },
		{ code: 'JTP', description: 'Classic Joey The Passions', example: 'JTP,ST5#123' }
	];
	return (
		<>
			<h1
				className='text-2xl md:text-3xl md:leading-[3.5rem] font-bold pt-6 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent'
			>
				{title}<br />
			</h1>
			<h3 className='text-lg text-gray-400 leading-8 max-w-4xl'>{description}</h3>
			<div className='overflow-x-auto mt-2 w-full max-w-3xl'>
				<table className='table bg-base-300'>
					<thead>
						<tr>
							<th className='max-w-[75px]'>Code</th>
							<th className='min-w-[200px]'>Description</th>
							<th>Example</th>
						</tr>
					</thead>
					<tbody>
						{
							commands.map((command) => (
								<tr key={command.code}>
									<td>{command.code}</td>
									<td>
										{command.description} {command.banlist ? <span className='badge badge-soft badge-info badge-xs'>{command.banlist}</span> : ''}
									</td>
									<td>{command.example}</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		</>
	);
}
