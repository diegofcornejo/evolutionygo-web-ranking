import { Pagination, A11y, Autoplay } from 'swiper/modules';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';

const slides = [
	{
		id: 1,
		image: 'https://placehold.co/600x400/000000/FFFFFF/png',
	},
	{
		id: 2,
		image: 'https://placehold.co/600x400/FF0000/FFFFFF/png',
	},
	{
		id: 3,
		image: 'https://placehold.co/600x400/00FF00/FFFFFF/png',
	},
	{
		id: 4,
		image: 'https://placehold.co/600x400/0000FF/FFFFFF/png',
	},
	{
		id: 5,
		image: 'https://placehold.co/600x400/FF00FF/FFFFFF/png',
	},
	{
		id: 6,
		image: 'https://placehold.co/600x400/FFFF00/FFFFFF/png',
	}
];

export default () => {
	return (
		<div className='mb-8'>
			<Swiper
				modules={[Pagination, A11y, Autoplay]}
				spaceBetween={50}
				slidesPerView={1}
				autoplay={{
					delay: 5000,
					disableOnInteraction: false,
				}}
				onSlideChange={() => console.log('slide change')}
				onSwiper={(swiper) => console.log(swiper)}
				pagination={{
					clickable: true,
				}}
			>
				{slides.map((slide) => (
					<SwiperSlide key={slide.id}>
						<div className='h-auto w-full bg-base-200 flex justify-center items-center'>
							<img src={slide.image} alt={`Slide ${slide.id}`} width={600} height={400}/>
						</div>
					</SwiperSlide>
				))}
				{/* <SwiperSlide>
					<div className='h-96 w-full bg-red-500'></div>
				</SwiperSlide>
				<SwiperSlide>
					<div className='h-96 w-full bg-blue-500'></div>
				</SwiperSlide>
				<SwiperSlide>
					<div className='h-96 w-full bg-green-500'></div>
				</SwiperSlide>
				<SwiperSlide>
					<div className='h-96 w-full bg-yellow-500'></div>
				</SwiperSlide> */}
			</Swiper>
		</div>
	);
};