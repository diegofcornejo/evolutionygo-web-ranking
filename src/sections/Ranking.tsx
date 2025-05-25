import { useState, useEffect } from 'react';
import DuelistCard from '@components/Cards/DuelistCard';
import Rating from '@components/Rating';
import type { Duelist } from '@types';
import { banlists } from '@stores/banlistsStore';

export default function Ranking() {
  const [duelists, setDuelists] = useState<Duelist[]>([]);
  const [topDuelists, setTopDuelists] = useState<Duelist[]>([]);
	const [season, setSeason] = useState<string>(import.meta.env.PUBLIC_DEFAULT_SEASON);
	const [banList, setBanList] = useState<string>(import.meta.env.PUBLIC_DEFAULT_BAN_LIST);
	const [banListOptions, setBanListOptions] = useState<string[]>([]);
	const API_URL = import.meta.env.PUBLIC_API_URL;

  
	const getBanListOptions = async () => {
		const response = await fetch(`${API_URL}/ban-lists`);
		const data = await response.json();
		setBanListOptions(data.filter((option: string) => option !== 'N/A'));
		banlists.set(data.filter((option: string) => option !== 'N/A'));
	};

	const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSeason(event.target.value);
	};

	const handleBanListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setBanList(event.target.value);
	};

  useEffect(() => {
    const fetchDuelists = async () => {
      const response = await fetch(
        `${API_URL}/stats/?page=1&limit=20&banListName=${banList}&season=${season}`
      );
      const data = await response.json();
      setTopDuelists(data.slice(0, 4));
      setDuelists(data.slice(4));
    };

    fetchDuelists();
  }, [API_URL, season, banList]);

	useEffect(() => {
		getBanListOptions();
	}, []);

  const getRating = (winRate: number) => 1 + (winRate / 100) * 4;

	const title = 'Top Players';
  const description = 'Explore the top players in our community. Discover who the standout competitors are in our tournaments and events. Get to know their achievements, strategies, and stay updated with the rankings.';

  return (
    <div className='mx-4' id='section-ranking'>
      <div className='flex flex-col gap-8 text-center place-items-center'>
        <h1 className='text-3xl md:text-5xl md:leading-[3.5rem] font-bold pt-6'>{title}</h1>
        <h2 className='text-lg text-gray-400 leading-8 max-w-4xl'>{description}</h2>
      </div>
      <div className="flex flex-row justify-center gap-4 pt-4">
        <select className="select select-secondary w-full max-w-xs" value={season} onChange={handleSeasonChange}>
				{/* <option disabled value={season}>
					{`Season ${season}`}
				</option> */}
				{Array.from({ length: parseInt(import.meta.env.PUBLIC_DEFAULT_SEASON) }, (_, index) => (
					<option key={index} value={index + 1}>
						{`Season ${index + 1}`}
					</option>
				)).reverse()}
        </select>
        <select className="select select-secondary w-full max-w-xs" value={banList} onChange={handleBanListChange}>
          {banListOptions.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <ul
        className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 p-0 place-items-stretch'
      >
        {topDuelists.map((duelist: Duelist, index: number) => (
          <DuelistCard key={duelist.userId} {...duelist} borderColor={index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'} banListName={banList} season={season} />
        ))}
      </ul>
      <div className='overflow-x-auto mt-8'>
        <table className='table table-zebra bg-base-300'>
          <thead>
            <tr>
              <th className='max-w-[75px] text-center'>Position</th>
              <th className='min-w-[200px]'>Username</th>
              <th>Points</th>
							<th>Games</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {duelists.map((duelist: Duelist) => (
              <tr key={duelist.userId}>
                <th className='max-w-[75px] text-center'>{duelist.position}</th>
                <td className='min-w-[200px] hover:bg-secondary'>
                  <a href={`/duelists/${duelist.userId}/${banList}?username=${duelist.username}&season=${season}`}>
                    <div className='flex items-center gap-3'>
                      <img
                        src={`https://ui-avatars.com/api/?name=${duelist.username}&background=random&size=128`}
                        alt={duelist.username}
                        className='w-12 h-12 rounded-full'
												loading='lazy'
												decoding='async'
                      />
                      <div>
                        <div className='font-bold'>{duelist.username}</div>
                        <Rating rating={getRating(duelist.winRate)} size='sm'/>
                      </div>
                    </div>
                  </a>
                </td>
                <td className='font-bold text-lg text-orange-300'>{duelist.points}</td>
								<td>{duelist.wins + duelist.losses}</td>
                <td className='text-success'>{duelist.wins}</td>
                <td className='text-error'>{duelist.losses}</td>
                <td>{duelist.winRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
