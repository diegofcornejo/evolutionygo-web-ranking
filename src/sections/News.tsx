import { Pagination, Autoplay} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Banner from '@components/Banner.tsx';
import type { News } from '@types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

export default () => {
	const news: News[] = [
		{
			id: 1,
			image: '/banners/banner1.webp',
			title: 'Season 5 is here!',
			description: 'Evolution version 2.7.0 is now available!'
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
};