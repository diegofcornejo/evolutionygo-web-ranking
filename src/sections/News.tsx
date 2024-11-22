import { Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Banner from '@components/Banner.tsx';
import type { News } from 'src/types/types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';

const news: News[] = [
	{
		id: 1,
		image: '/banners/banner1.webp',
		title: 'Season 4 is here!',
		description: 'Evolution version 2.4.0 is now available!'
	},
	{
		id: 2,
		image: '/banners/banner2.webp',
		title: 'TCG Champions 2024',
		description: 'TEAM HABANA is the new champion!'
	},
	{
		id: 3,
		image: '/banners/banner3.webp',
		title: 'Edison Champions 2024',
		description: 'TEAM AyD Heaven is the new champion!'
	}
];

export default () => {
	return (
		<div className='mb-8 mx-4'>
			<Swiper
				modules={[Pagination, A11y, Autoplay]}
				spaceBetween={50}
				slidesPerView={1}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
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
};