import { Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { toast } from 'sonner';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';

const slides = [
	{
		id: 1,
		image: 'https://placehold.co/1200x400/999999/FFFFFF/png',
	},
	{
		id: 2,
		image: 'https://placehold.co/1200x400/8A9BA8/FFFFFF/png',
	},
	{
		id: 3,
		image: 'https://placehold.co/1200x400/9A8CA8/FFFFFF/png',
	},
	{
		id: 4,
		image: 'https://placehold.co/1200x400/A88A8A/FFFFFF/png',
	},
	{
		id: 5,
		image: 'https://placehold.co/1200x400/A8A58A/FFFFFF/png',
	},
	{
		id: 6,
		image: 'https://placehold.co/1200x400/7F8A8A/FFFFFF/png',
	}
];

const handleToast = () => {
	toast.success('Hello, world!')
}

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
				// onSlideChange={() => console.log('slide change')}
				// onSwiper={(swiper) => console.log(swiper)}
				pagination={{
					clickable: true,
				}}
			>
				{slides.map((slide) => (
					<SwiperSlide key={slide.id}>
						<div className='h-auto w-full bg-base-200 flex justify-center items-center' onClick={handleToast}>
							<img src={slide.image} alt={`Slide ${slide.id}`} className='cursor-pointer w-full aspect-[3/1] md:aspect-[4/1] object-cover'/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};