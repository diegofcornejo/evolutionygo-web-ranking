import { useState } from 'react';

interface Clan {
	id: string;
	name: string;
	registeredAt: string;
	members: Array<{
		id: string;
		username: string;
	}>;
}

interface ClanListProps {
	clans: Clan[];
}

const getAvatarUrl = (username: string) => {
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=128`;
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export default function ClanList({ clans }: ClanListProps) {
	const [selectedClanId, setSelectedClanId] = useState<string | null>(
		clans.length > 0 ? clans[0].id : null
	);

	const selectedClan = clans.find((clan) => clan.id === selectedClanId);

	return (
		<div className='flex flex-col lg:flex-row gap-4 h-full'>
			{/* Left: Clan List */}
			<div className='lg:w-1/2'>
				<div className='card bg-base-300 shadow-xl h-full'>
					<div className='card-body'>
						<h2 className='card-title text-2xl mb-4'>
							Registered Clans ({clans.length})
						</h2>
						<div className='flex flex-col gap-2 max-h-[600px] overflow-y-auto'>
							{clans.length === 0 ? (
								<p className='text-gray-400 text-center py-8'>No clans registered yet</p>
							) : (
								clans.map((clan) => (
									<div
										key={clan.id}
										className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
											selectedClanId === clan.id
												? 'bg-primary text-primary-content'
												: 'bg-base-200 hover:bg-base-100'
										}`}
										onClick={() => setSelectedClanId(clan.id)}
									>
										<div className='flex items-center gap-3'>
											<div className='avatar'>
												<div className='w-10 rounded-full'>
													<img
														src={getAvatarUrl(clan.name)}
														alt={clan.name}
														loading='lazy'
														decoding='async'
													/>
												</div>
											</div>
											<div className='flex flex-col'>
												<span className='font-semibold'>{clan.name}</span>
												<span className='text-xs opacity-70'>
													Registered on {formatDate(clan.registeredAt)}
												</span>
											</div>
										</div>
										<div className='badge badge-outline'>{clan.members.length} members</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Right: Clan Members */}
			<div className='lg:w-1/2'>
				<div className='card bg-base-300 shadow-xl h-full'>
					<div className='card-body'>
						<h2 className='card-title text-2xl mb-4'>
							{selectedClan ? `${selectedClan.name} Members` : 'Select a Clan'}
						</h2>
						<div className='flex flex-col gap-2 max-h-[600px] overflow-y-auto'>
							{!selectedClan ? (
								<p className='text-gray-400 text-center py-8'>Select a clan to view members</p>
							) : selectedClan.members.length === 0 ? (
								<p className='text-gray-400 text-center py-8'>No members in this clan</p>
							) : (
								selectedClan.members.map((member) => (
									<div key={member.id} className='flex items-center justify-between p-3 bg-base-200 rounded-lg'>
										<div className='flex items-center gap-3'>
											<div className='avatar'>
												<div className='w-10 rounded-full'>
													<img
														src={getAvatarUrl(member.username)}
														alt={member.username}
														loading='lazy'
														decoding='async'
													/>
												</div>
											</div>
											<div className='flex flex-col'>
												<span className='font-semibold'>{member.username}</span>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

