import { useState, useEffect } from 'react';
import DuelistCard from '@components/Cards/DuelistCard';
import Rating from '@components/Rating';
import type { Duelist } from '@types';
import type { BanListSelectorOption } from '@utils/banListSelector';
import { banlists } from '@stores/banlistsStore';
import { getSession } from '@stores/sessionStore';
import {
  buildBanListChips,
  buildBanListSelectorOptions,
  buildFlatBanListSelectorOptions,
  findBanListSelectorOption,
  flattenBanListSelectorOptions,
  isBanListSectionList,
} from '@utils/banListSelector';

type BorderColor = 'gold' | 'silver' | 'bronze';

type SortBy = 'points' | 'rating';

const getBorderColor = (index: number): BorderColor => {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  return 'bronze';
};

const buildUserStatsUrl = (apiUrl: string, userId: string, season: string, banList: string): string => {
  const baseUrl = `${apiUrl}/users/${userId}/stats?season=${season}`;
  if (banList === 'Global') {
    return baseUrl;
  }
  return `${baseUrl}&banListName=${banList}`;
};

export default function Ranking() {
  const [duelists, setDuelists] = useState<Duelist[]>([]);
  const [topDuelists, setTopDuelists] = useState<Duelist[]>([]);
	const [season, setSeason] = useState<string>(import.meta.env.PUBLIC_DEFAULT_SEASON);
	const [banList, setBanList] = useState<string>(import.meta.env.PUBLIC_DEFAULT_BAN_LIST);
	const [banListOptions, setBanListOptions] = useState<BanListSelectorOption[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>('points');
	const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
	const [currentUserStats, setCurrentUserStats] = useState<Duelist | null>(null);
	const API_URL = import.meta.env.PUBLIC_API_URL;

	
	useEffect(() => {
		const session = getSession();
		if (session.isLoggedIn && session.user) {
			setCurrentUser({ id: session.user.id, username: session.user.username });
		}
	}, []);

	
	const fetchCurrentUserStats = async () => {
		if (!currentUser) return;
		
		try {
			const url = buildUserStatsUrl(API_URL, currentUser.id, season, banList);
			const response = await fetch(url);
			
			if (response.ok) {
				const userStats = await response.json();
				setCurrentUserStats(userStats);
			} else {
				setCurrentUserStats(null);
			}
		} catch (error) {
			console.error('Error fetching current user stats:', error);
			setCurrentUserStats(null);
		}
	};

	useEffect(() => {
		if (currentUser) {
			fetchCurrentUserStats();
		}
	}, [currentUser, season, banList]);

	const isUserInRankings = (userId: string) => {
		const inTopDuelists = topDuelists.some(duelist => duelist.userId === userId);
		const inDuelists = duelists.some(duelist => duelist.userId === userId);
		return inTopDuelists || inDuelists;
	};

	const getDisplayName = (duelist: Duelist) => {
		if (currentUser && duelist.userId === currentUser.id) {
			return `${duelist.username} (You)`;
		}
		return duelist.username;
	};

	const getDisplayDuelists = () => {
		if (!currentUser || !currentUserStats || isUserInRankings(currentUser.id)) {
			return duelists;
		}
		
		const currentUserDuelist: Duelist = {
			...currentUserStats,
		};
		
		return [...duelists, currentUserDuelist];
	};
  
	const applyBanListOptions = (options: BanListSelectorOption[]) => {
		setBanListOptions(options);
		banlists.set(flattenBanListSelectorOptions(options));
	};

	const getFlatBanListOptions = async () => {
		try {
			const response = await fetch(`${API_URL}/ban-lists?season=${season}`);
			const data = await response.json();
			applyBanListOptions(buildFlatBanListSelectorOptions(data));
		} catch (error) {
			console.error('Error fetching ban lists:', error);
		}
	};

	const getBanListOptions = async () => {
		try {
			const response = await fetch(`${API_URL}/ban-lists/grouped?season=${season}`);
			if (!response.ok) {
				throw new Error(`Grouped ban lists request failed with status ${response.status}`);
			}
			const data = await response.json();
			if (!isBanListSectionList(data)) {
				throw new Error('Grouped ban lists payload is not a list of sections');
			}
			const options = buildBanListSelectorOptions(data);
			if (options.length === 0) {
				throw new Error('Grouped ban lists payload has no selectable ban list');
			}
			applyBanListOptions(options);
		} catch (error) {
			console.error('Error fetching grouped ban lists, falling back to the flat list:', error);
			await getFlatBanListOptions();
		}
	};

	const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSeason(event.target.value);
	};

	const handleBanListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setBanList(event.target.value);
	};

	const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSortBy(event.target.value as SortBy);
	};

  useEffect(() => {
    const fetchDuelists = async () => {
      const response = await fetch(
        `${API_URL}/stats/?page=1&limit=20&banListName=${banList}&season=${season}&sortBy=${sortBy}`
      );
      const data = await response.json();
      setTopDuelists(data.slice(0, 4));
      setDuelists(data.slice(4));
    };

    fetchDuelists();
  }, [API_URL, season, banList, sortBy]);

	useEffect(() => {
		getBanListOptions();
	}, [season]);

  const getRating = (winRate: number) => 1 + (winRate / 100) * 4;

	const selectedFormat = findBanListSelectorOption(banListOptions, banList);
	const banListChips = buildBanListChips(selectedFormat);

	const title = 'Top Players';
  const description = 'Explore the top players in our community. Discover who the standout competitors are in our tournaments and events. Get to know their achievements, strategies, and stay updated with the rankings.';

  return (
    <div className='mx-4' id='section-ranking'>
      <div className='flex flex-col gap-8 text-center place-items-center'>
        <h1 className='text-3xl md:text-5xl md:leading-[3.5rem] font-bold pt-6'>{title}</h1>
        <h2 className='text-lg text-gray-400 leading-8 max-w-4xl'>{description}</h2>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
        <select className="select select-secondary w-full max-w-xs" value={season} onChange={handleSeasonChange} aria-label="Filter by season">
				{Array.from({ length: Number.parseInt(import.meta.env.PUBLIC_DEFAULT_SEASON) }, (_, index) => (
					<option key={index} value={index + 1}>
						{`Season ${index + 1}`}
					</option>
				)).reverse()}
        </select>
        <select className="select select-secondary w-full max-w-xs" value={selectedFormat ? selectedFormat.value : banList} onChange={handleBanListChange} aria-label="Filter by banlist">
          {banListOptions.map((option: BanListSelectorOption) => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>
        <select className="select select-secondary w-full max-w-xs" value={sortBy} onChange={handleSortByChange} aria-label="Sort by">
          <option value="points">Sort by Points</option>
          <option value="rating">Sort by Elo</option>
        </select>
      </div>
      {banListChips.length > 0 && selectedFormat ? (
        <div
          className='flex flex-wrap justify-center gap-2 pt-4'
          role='group'
          aria-label={`Ban lists in ${selectedFormat.value}`}
        >
          {banListChips.map((chip: string, index: number) => (
            <button
              key={chip}
              type='button'
              className={`btn btn-xs ${chip === banList ? 'btn-secondary btn-active' : 'btn-outline'}`}
              aria-pressed={chip === banList}
              aria-label={index === 0 ? `All ${chip}` : undefined}
              onClick={() => setBanList(chip)}
            >
              {index === 0 ? 'All' : chip}
            </button>
          ))}
        </div>
      ) : null}
      <p className='text-center text-sm text-gray-400 pt-4'>
        <span className='badge badge-sm badge-warning' aria-hidden='true'>?</span> marks a provisional Elo: a rating
        stays provisional until the player has 10 duels in that ban list.
      </p>
      <ul
        className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 p-0 place-items-stretch'
      >
        {topDuelists.map((duelist: Duelist, index: number) => (
          <DuelistCard 
            key={duelist.userId} 
            {...duelist} 
            username={getDisplayName(duelist)}
            borderColor={getBorderColor(index)} 
            banListName={banList} 
            season={season} 
          />
        ))}
      </ul>
      <div className='overflow-x-auto mt-8'>
        <table className='table table-zebra bg-base-300'>
          <thead>
            <tr>
              <th scope="col" className='max-w-[75px] text-center'>Position</th>
              <th scope="col" className='min-w-[200px]'>Username</th>
              <th scope="col">Points</th>
              <th scope="col">Elo</th>
              <th scope="col">Games</th>
              <th scope="col">Wins</th>
              <th scope="col">Losses</th>
              <th scope="col">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {getDisplayDuelists().map((duelist: Duelist) => (
              <tr key={duelist.userId}>
                <th scope="row" className='max-w-[75px] text-center'>{duelist.position}</th>
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
                        <div className='font-bold'>{getDisplayName(duelist)}</div>
                        <Rating rating={getRating(duelist.winRate)} size='sm'/>
                      </div>
                    </div>
                  </a>
                </td>
                <td className='font-bold text-lg text-orange-300'>{duelist.points}</td>
                <td>
                  {duelist.rating == null ? (
                    <span className='text-gray-400' aria-label='No Elo on this ladder'>—</span>
                  ) : (
                    <span className='flex items-center gap-2'>
                      <span className='font-bold text-lg text-info'>{Math.round(duelist.rating)}</span>
                      {duelist.provisional ? (
                        <span className='badge badge-sm badge-warning' title='Provisional Elo — not enough duels yet'>?</span>
                      ) : null}
                    </span>
                  )}
                </td>
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
