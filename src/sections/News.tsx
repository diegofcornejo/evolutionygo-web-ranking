import { Pagination, Autoplay} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Banner from '@components/Banner.tsx';
import type { News } from '@types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

export default function NewsSection() {
	const news: News[] = [
		{
			id: 6,
			image: '/banners/banner_season_7.webp',
			title: 'EvoDuel is here!',
			description: 'The wait is over! EvoDuel\'s first public version is here in Open Beta. Duel anywhere, report bugs, and earn your place among the first duelists of a new era.',
			buttonLink: 'https://evoduel.com',
			buttonText: 'Play Now'
		},
		// {
		// 	id: 4,
		// 	image: '/banners/banner4.webp',
		// 	title: 'Torneo Continental TCG BPRO TCG - GR 2026',
		// 	description: 'Country Cuba "A" is the new champion: Meliodas (líder), Just Hansel, YanxAsh, Eislier, LD, Leynier, Plácido, Legarde, Ray_V, Guevara'
		// },
		// {
		// 	id: 5,
		// 	image: '/banners/banner5.webp',
		// 	title: 'WAR LATAM Diciembre 2025 a Marzo 2026',
		// 	description: 'Team DragonSlayers is the new champion: Ricardostar07, Akeno, Akane, JesusVE, Shinobu, Killer BR, El Chema'
		// },
		// {
		// 	id: 1,
		// 	image: '/banners/banner1.webp',
		// 	title: 'Season 6 is here!',
		// 	description: 'Evolution version 2.11.0 is now available!'
		// },
		// {
		// 	id: 2,
		// 	image: '/banners/banner2.webp',
		// 	title: 'TCG Champions',
		// 	description: 'TEAM HABANA is the new champion!'
		// },
		// {
		// 	id: 3,
		// 	image: '/banners/banner3.webp',
		// 	title: 'Edison Champions',
		// 	description: 'TEAM AyD Heaven is the new champion!'
		// },
	];
	return (
		<div className='mb-8 mx-4'>
			<Swiper
				modules={[Pagination, Autoplay]}
				slidesPerView={1}
				autoplay={{
					delay: 5000,
					disableOnInteraction: true,
				}}
				// onSlideChange={() => console.log('slide change')}
				// onSwiper={(swiper) => console.log(swiper)}
				pagination={{
					clickable: true,
				}}
			>
				{news.map((newsItem) => (
					<SwiperSlide key={newsItem.id}>
						<Banner
							id={newsItem.id}
							image={newsItem.image}
							title={newsItem.title}
							description={newsItem.description}
							buttonLink={newsItem.buttonLink}
							buttonText={newsItem.buttonText}
						/>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}
