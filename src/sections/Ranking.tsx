import { useState, useEffect } from 'react';
import Select from 'react-select';
import DuelistCard from '@components/Cards/DuelistCard';
import Rating from '@components/Rating';
import type { Duelist } from '@types';

const apiUrl = import.meta.env.PUBLIC_API_URL;

export default function Ranking() {
  const [duelists, setDuelists] = useState<Duelist[]>([]);
  const [topDuelists, setTopDuelists] = useState<Duelist[]>([]);
	const [season, setSeason] = useState<string>('Season 3');
	const [banList, setBanList] = useState<string>('Global');
	const [banListOptions, setBanListOptions] = useState<string[]>([]);

  
	const getBanListOptions = async () => {
		const response = await fetch(`${apiUrl}/ban-lists`);
		const data = await response.json();
		setBanListOptions(data);
	};

	const handleSeasonChange = (option: { label: string, value: string } | null) => {
		if (option) {
			setSeason(option.value);
		}
	};

	const handleBanListChange = (option: { label: string, value: string } | null) => {
		if (option) {
			setBanList(option.value);
		}
	};

  useEffect(() => {
    const fetchDuelists = async () => {
      const response = await fetch(
        `${apiUrl}/stats/?page=1&limit=20&banListName=${banList}&season=${season}`
      );
      const data = await response.json();
      setTopDuelists(data.slice(0, 4));
      setDuelists(data.slice(4));
    };

    fetchDuelists();
  }, [apiUrl, season, banList]);

	useEffect(() => {
		getBanListOptions();
	}, []);

  const getRating = (winRate: number) => 1 + (winRate / 100) * 4;

	const title = 'Top Players';
  const description = 'Explore the top players in our community. Discover who the standout competitors are in our tournaments and events. Get to know their achievements, strategies, and stay updated with the rankings.';

  return (
    <div className='py-24 mx-4' id='section-ranking'>
      <div className='flex flex-col gap-8 text-center place-items-center'>
        <h1 className='text-3xl md:text-5xl md:leading-[3.5rem] font-bold pt-6'>{title}</h1>
        <h2 className='text-lg text-gray-400 leading-8 max-w-4xl'>{description}</h2>
      </div>
      <div className="flex flex-row justify-center gap-4 pt-4">
        {/* <select className="select select-secondary w-full max-w-xs" value={season} onChange={handleSeasonChange}>
          <option disabled>{season}</option>
        </select> */}
				<Select
					instanceId='selector-season'
					className='w-full max-w-xs text-sm'
					defaultValue={{label: season, value: season}}
					onChange={handleSeasonChange}
					isSearchable={true}
					options={['Season 3'].map((option: string) => ({label: option, value: option}))}
					theme={(theme) => ({
						...theme,
						colors: {
							...theme.colors,
							neutral0: '#0F172A',
							neutral20: 'oklch(68.0113% 0.158303 276.934902 / 1)',
							neutral80: '#FFFFFF',
							primary25: '#16213E',
							primary: 'oklch(68.0113% 0.158303 276.934902 / 1)',
						},
					})}
				/>

				<Select
					instanceId='selector-banlist'
					className='w-full max-w-xs text-sm'
					defaultValue={{label: banList, value: banList}}
					onChange={handleBanListChange}
					isSearchable={true}
					options={banListOptions.map((option: string) => ({label: option, value: option}))}
					theme={(theme) => ({
						...theme,
						colors: {
							...theme.colors,
							neutral0: '#0F172A',
							neutral20: 'oklch(68.0113% 0.158303 276.934902 / 1)',
							neutral80: '#FFFFFF',
							primary25: '#16213E',
							primary: 'oklch(68.0113% 0.158303 276.934902 / 1)',
						},
					})}
				/>
        {/* <select className="select select-secondary w-full max-w-xs" value={banList} onChange={handleBanListChange}>
          {banListOptions.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select> */}
      </div>
      <ul
        role='list'
        className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 p-0 place-items-stretch'
      >
        {topDuelists.map((duelist: Duelist) => (
          <DuelistCard key={duelist.userId} {...duelist} />
        ))}
      </ul>
      <div className='overflow-x-auto mt-8'>
        <table className='table bg-base-300'>
          <thead>
            <tr>
              <th className='max-w-[75px] text-center'>Position</th>
              <th className='min-w-[200px]'>Username</th>
              <th>Points</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {duelists.map((duelist: Duelist) => (
              <tr key={duelist.userId} className='hover:bg-secondary'>
                <th className='max-w-[75px] text-center'>{duelist.position}</th>
                <td className='min-w-[200px]'>
                  <a href={`/duelists/${duelist.userId}`}>
                    <div className='flex items-center gap-3'>
                      <img
                        src={`https://ui-avatars.com/api/?name=${duelist.username}&background=random&size=128`}
                        alt={duelist.username}
                        className='w-12 h-12 rounded-full'
                      />
                      <div>
                        <div className='font-bold'>{duelist.username}</div>
                        <Rating rating={getRating(duelist.winRate)} size='sm'/>
                      </div>
                    </div>
                  </a>
                </td>
                <td className='font-bold'>{duelist.points}</td>
                <td>{duelist.wins}</td>
                <td>{duelist.losses}</td>
                <td>{duelist.winRate.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
