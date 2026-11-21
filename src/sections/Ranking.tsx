import { useState, useEffect } from 'react';
import DuelistTradingCard from '@components/Cards/DuelistTradingCard';
import PodiumVortex from '@components/PodiumVortex';
import Rating from '@components/Rating';
import type { Duelist } from '@types';
import type { BanListSelectorOption } from '@utils/banListSelector';
import { formatWinRate, winRateStars } from '@utils/winRate';
import type { WeeklyDuelist } from '@utils/weeklyDuelist';
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

type SortBy = 'points' | 'rating';

// Global has no Elo ladder: the API sends rating null for it.
const GLOBAL_BAN_LIST = 'Global';

// Native selects (so phones open their own picker), styled as pills to match the rest of the home.
const PILL_SELECT =
  'select h-10 w-auto rounded-full border-white/20 bg-white/10 pl-4 pr-9 text-sm font-bold text-white focus:outline-primary';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'points', label: 'Points' },
  { value: 'rating', label: 'Elo' },
];

// DOM order is 1, 2, 3 (reading order). Mobile: #1 across the top, #2 and #3 below.
// Desktop: explicit columns, so a lone #1 still sits in the middle: #2 left, #1 center and raised, #3 right.
const PODIUM_SLOT = [
  'col-span-2 mx-auto w-[58%] md:col-span-1 md:col-start-2 md:row-start-1 md:w-full md:-translate-y-8',
  'w-full md:col-start-1 md:row-start-1 md:mx-auto md:w-[86%]',
  'w-full md:col-start-3 md:row-start-1 md:mx-auto md:w-[86%]',
];

const buildUserStatsUrl = (apiUrl: string, userId: string, season: string, banList: string): string => {
  const baseUrl = `${apiUrl}/users/${userId}/stats?season=${season}`;
  if (banList === 'Global') {
    return baseUrl;
  }
  return `${baseUrl}&banListName=${banList}`;
};

// The duelist of the week is fetched on the server (index.astro) so it is there from the first render.
export default function Ranking({ weekly = null }: Readonly<{ weekly?: WeeklyDuelist | null }>) {
  const [duelists, setDuelists] = useState<Duelist[]>([]);
  const [topDuelists, setTopDuelists] = useState<Duelist[]>([]);
	const [season, setSeason] = useState<string>(import.meta.env.PUBLIC_DEFAULT_SEASON);
	const [banList, setBanList] = useState<string>(import.meta.env.PUBLIC_DEFAULT_BAN_LIST);
	const [banListOptions, setBanListOptions] = useState<BanListSelectorOption[]>([]);
	const isGlobal = banList === GLOBAL_BAN_LIST;
	// With no podium (empty ladder) the weekly card is centered instead of sitting in the fifth column.
	const weeklyBeside = !!weekly && topDuelists.length > 0;
	const [sortBy, setSortBy] = useState<SortBy>('points');
	const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
	const [currentUserStats, setCurrentUserStats] = useState<Duelist | null>(null);
	const API_URL = import.meta.env.PUBLIC_API_URL;
	// Cards wait for the first leaderboard response so the podium row never reflows when it lands.
	const [leaderboardLoaded, setLeaderboardLoaded] = useState(false);

	
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

	const selectBanList = (nextBanList: string) => {
		setBanList(nextBanList);
		if (nextBanList === GLOBAL_BAN_LIST) setSortBy('points');
	};

	const handleBanListChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		selectBanList(event.target.value);
	};


  useEffect(() => {
    const fetchDuelists = async () => {
      const response = await fetch(
        `${API_URL}/stats/?page=1&limit=20&banListName=${banList}&season=${season}&sortBy=${sortBy}`
      );
      const data = await response.json();
      setTopDuelists(data.slice(0, 3));
      setDuelists(data.slice(3));
      setLeaderboardLoaded(true);
    };

    fetchDuelists();
  }, [API_URL, season, banList, sortBy]);

	useEffect(() => {
		getBanListOptions();
	}, [season]);

	const selectedFormat = findBanListSelectorOption(banListOptions, banList);
	const banListChips = buildBanListChips(selectedFormat);

	const title = 'Top Players';

  return (
    <div className='mx-4' id='section-ranking'>
      <div className='relative z-10 flex flex-col items-center gap-1 pt-6 text-center'>
        <h2 className='text-3xl font-bold md:text-5xl md:leading-[3.5rem]'>{title}</h2>
        <p className='text-sm font-bold uppercase tracking-[0.18em] text-indigo-300'>Season {season} · {banList}</p>
      </div>
      <div className='relative z-10 flex flex-wrap items-center justify-center gap-2 pt-5'>
        <select className={PILL_SELECT} value={season} onChange={handleSeasonChange} aria-label="Filter by season">
				{Array.from({ length: Number.parseInt(import.meta.env.PUBLIC_DEFAULT_SEASON) }, (_, index) => (
					<option key={index} value={index + 1}>
						{`Season ${index + 1}`}
					</option>
				)).reverse()}
        </select>
        <select className={PILL_SELECT} value={selectedFormat ? selectedFormat.value : banList} onChange={handleBanListChange} aria-label="Filter by banlist">
          {banListOptions.map((option: BanListSelectorOption) => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>
        <div role='group' aria-label='Sort by' className='flex h-10 items-center rounded-full border border-white/20 bg-white/10 p-1'>
          {SORT_OPTIONS.filter((option) => option.value === 'points' || !isGlobal).map((option) => (
            <button
              key={option.value}
              type='button'
              aria-pressed={sortBy === option.value}
              onClick={() => setSortBy(option.value)}
              className={`h-8 rounded-full px-4 text-sm font-bold transition-colors ${
                sortBy === option.value ? 'bg-primary text-primary-content' : 'text-white/80 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {banListChips.length > 0 && selectedFormat ? (
        <div
          className='relative z-10 flex flex-wrap justify-center gap-2 pt-4'
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
              onClick={() => selectBanList(chip)}
            >
              {index === 0 ? 'All' : chip}
            </button>
          ))}
        </div>
      ) : null}
      {leaderboardLoaded && (
      <div className='relative isolate -mx-4 overflow-x-clip px-4'>
      <ul
        aria-label='Top three duelists'
        className={`relative mx-auto mt-16 grid max-w-4xl grid-cols-2 items-end gap-x-4 gap-y-8 p-0 sm:gap-x-6 md:grid-cols-3 md:gap-x-8 ${
          weekly ? 'lg:max-w-6xl' : ''
        } ${weeklyBeside ? 'lg:grid-cols-[1fr_1.15fr_1fr_auto_1fr]' : ''}`}
      >
        {topDuelists.map((duelist: Duelist, index: number) => (
          <li key={duelist.userId} className={`relative ${PODIUM_SLOT[index]}`}>
            {index === 0 && <PodiumVortex />}
            <DuelistTradingCard
              {...duelist}
              username={getDisplayName(duelist)}
              place={(index + 1) as 1 | 2 | 3}
              featured={index === 0}
              showElo={!isGlobal}
              banListName={banList}
              season={season}
            />
          </li>
        ))}
        {weekly && (
          <>
            {weeklyBeside && (
              <li
                aria-hidden='true'
                data-podium-divider
                className='hidden w-px self-stretch bg-gradient-to-b from-transparent via-base-content/20 to-transparent lg:col-start-4 lg:row-start-1 lg:block'
              />
            )}
            <li
              className={`col-span-2 mx-auto w-[48%] md:col-span-3 md:w-[30%] ${
                weeklyBeside ? 'lg:col-span-1 lg:col-start-5 lg:row-start-1 lg:w-[86%]' : 'lg:w-[22%]'
              }`}
            >
              <DuelistTradingCard
                {...weekly.duelist}
                place={1}
                showElo={false}
                banListName='Global'
                season={import.meta.env.PUBLIC_DEFAULT_SEASON}
                weekly={{ from: weekly.from, to: weekly.to }}
              />
            </li>
          </>
        )}
      </ul>
      </div>
      )}
      {getDisplayDuelists().length > 0 && (
      <div className='overflow-x-auto mt-8'>
        <table className='table table-zebra bg-base-300'>
          <thead>
            <tr>
              <th scope="col" className='max-w-[75px] text-center'>Position</th>
              <th scope="col" className='min-w-[200px]'>Username</th>
              <th scope="col">Points</th>
              {!isGlobal && <th scope="col">Elo</th>}
              <th scope="col">Games</th>
              <th scope="col">Wins</th>
              <th scope="col">Losses</th>
              <th scope="col">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {getDisplayDuelists().map((duelist: Duelist) => (
              <tr key={duelist.userId} className='relative cursor-pointer hover:bg-secondary transition-colors'>
                <th scope="row" className='max-w-[75px] text-center'>{duelist.position}</th>
                <td className='min-w-[200px]'>
                  <a className='after:absolute after:inset-0' href={`/duelists/${duelist.userId}/${banList}?username=${duelist.username}&season=${season}`}>
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
                        <Rating rating={winRateStars(duelist.winRate)} size='sm'/>
                      </div>
                    </div>
                  </a>
                </td>
                <td className='font-bold text-lg text-orange-300'>{duelist.points}</td>
                {!isGlobal && <td>
                  {duelist.rating == null ? (
                    <span className='text-gray-400' aria-label='No Elo on this ladder'>—</span>
                  ) : (
                    <span className='flex items-center gap-2'>
                      <span className='font-bold text-lg text-info'>{Math.round(duelist.rating)}</span>
                      {duelist.provisional ? (
                        <span className='badge badge-sm badge-warning relative z-10' title='Provisional Elo — not enough duels yet'>?</span>
                      ) : null}
                    </span>
                  )}
                </td>}
								<td>{duelist.wins + duelist.losses}</td>
                <td className='text-success'>{duelist.wins}</td>
                <td className='text-error'>{duelist.losses}</td>
                <td>{formatWinRate(duelist.winRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
