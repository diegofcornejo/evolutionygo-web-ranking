import { Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { toast } from 'sonner';
import Banner from './Banner.tsx';
import type { News } from '@types';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';

const news: News[] = [
	{
		id: 1,
		image: '/banner.webp',
		title: 'Season 4 is here!',
		description: 'Evolution version 3.0.0 is now available!',
		buttonText: 'More details',
		buttonLink: '/store',
	},
	{
		id: 2,
		image: '/banner.webp',
		title: 'TCG Champions 2024',
		description: 'This is an example of a news item.',
		buttonText: 'More details',
		buttonLink: '/store',
	},
	{
		id: 3,
		image: '/banner.webp',
		title: 'Official daisyUI',
		description: 'This is an example of a news item.',
		buttonText: 'More details',
		buttonLink: '/store',
	},
	{
		id: 4,
		image: '/banner.webp',
		title: 'Official daisyUI 2',
		description: 'This is an example of a news item.',
		buttonText: 'More details',
		buttonLink: '/store',
	},
	{
		id: 5,
		image: '/banner.webp',
		title: 'Evolution New 3',
		description: 'This is an example of a news item.',
		buttonText: 'More details',
		buttonLink: '/store',
	},
	{
		id: 6,
		image: '/banner.webp',
		title: 'Evolution New 4',
		description: 'This is an example of a news item.',
		buttonText: 'More details',
		buttonLink: '/store',
	}
];

const handleToast = () => {
	toast.success('Hello, world!')
}

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
							image={newsItem.image}
							title={newsItem.title}
							description={newsItem.description}
							buttonText={newsItem.buttonText}
							buttonLink={newsItem.buttonLink}
						/>
						{/* <div className='h-auto w-full bg-base-200 flex justify-center items-center' onClick={handleToast}>
							<img src={slide.image} alt={`Slide ${slide.id}`} className='cursor-pointer w-full aspect-[3/1] md:aspect-[4/1] object-cover'/>
						</div> */}
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};