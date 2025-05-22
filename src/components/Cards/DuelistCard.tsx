
import type { Duelist } from '@types';
import Rating from '@components/Rating';

interface Props extends Duelist {
	banListName: string;
	season: string;
	clickable?: boolean;
}

export default ({ userId, username, points, wins, losses, winRate, position, borderColor = 'transparent', banListName, season, clickable = true }: Props) => {
	const image = `https://ui-avatars.com/api/?name=${username}&background=random&size=128`;
	const rating = 1 + (winRate / 100) * 4;
	return (
		<a href={clickable ? `/duelists/${userId}/${banListName}?username=${username}&season=${season}` : undefined}
			className={`card bg-base-300 w-full shadow-xl cursor-pointer max-w-sm hover:bg-neutral transition-all duration-200 ease-in-out border-2 border-${borderColor}`}>
			<div className='flex flex-col items-center gap-4'>
				<figure>
					<img
						src={image}
						alt={username}
						className='w-24 h-24 rounded-full mt-8'
						loading='lazy'
						decoding='async'
					/>
				</figure>
				<Rating rating={rating} size='lg' />
			</div>
			<div className='card-body text-center'>
				<h2
					className='font-bold text-2xl'
				>
					#{position} {username}
				</h2>
				<p className='text-lg font-bold text-orange-300'>Points: {points}</p>
				<p className='text-sm text-success'>Wins: {wins}</p>
				<p className='text-sm text-error'>Losses: {losses}</p>
				<p className='text-sm'>Win Rate: {winRate.toFixed(2)}%</p>
			</div>
		</a>)
}
