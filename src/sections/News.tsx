import { useEffect, useState } from 'react';
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Banner from '@components/Banner.tsx';
import type { News } from '@types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

function usePrefersReducedMotion() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(
		() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
		if (!mediaQuery) return;

		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		mediaQuery.addEventListener('change', updatePreference);
		return () => mediaQuery.removeEventListener('change', updatePreference);
	}, []);

	return prefersReducedMotion;
}

export default function NewsSection() {
	const prefersReducedMotion = usePrefersReducedMotion();
	const news: News[] = [
		{
			id: 7,
			image: '/banners/news-season-7.webp',
			title: 'Season 7 is live',
			description: 'A new season begins: every ladder starts from zero and the race for the top is wide open again. Pick your format and start climbing.',
			buttonLink: '#section-ranking',
			buttonText: 'Start climbing'
		},
		{
			id: 8,
			image: '/banners/news-season-7-dragon.webp',
			title: 'Your rating now knows who you beat',
			description: 'Ranked duels move an Elo rating, and beating a stronger duelist moves it further. Everyone starts at 1000, your first ten duels place you fast, and every format keeps a rating of its own.',
			buttonLink: '#section-ranking',
			buttonText: 'See the rankings'
		},
		{
			id: 6,
			image: '/banners/news-season-7-winged.webp',
			title: 'EvoDuel 1.0.0 is here',
			description: "The beta is over. EvoDuel's first official release is live — duel from any device, no install, no waiting. Your account and your rank come with you.",
			buttonLink: 'https://evoduel.com',
			buttonText: 'Play Now'
		},
		{
			id: 9,
			image: '/banners/news-edison.webp',
			title: 'Edison, exactly as it was',
			description: 'Edison format is live on EvoDuel, running the original rulings of its era — the same interactions duelists learned back then, not their modern rewrites.',
			buttonLink: 'https://evoduel.com',
			buttonText: 'Play Edison'
		},
		{
			id: 10,
			image: '/banners/news-rush.webp',
			title: 'Rush Duel, now in beta',
			description: 'Rush Duel is playable on EvoDuel while we put it through its paces. Jump in, duel, and tell us what breaks.',
			buttonLink: 'https://evoduel.com',
			buttonText: 'Try the beta'
		},
	];
	return (
		<section aria-label="Latest news" className="relative mx-4 mb-10">
			<Swiper
				aria-label="Latest news"
				className="pb-10 [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-6 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-base-content/40 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet-active]:w-10 [&_.swiper-pagination-bullet-active]:bg-primary"
				modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
				slidesPerView={1}
				autoplay={prefersReducedMotion ? false : {
					delay: 5000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				grabCursor
				keyboard={{
					enabled: true,
					onlyInViewport: true,
				}}
				loop
				navigation={{
					nextEl: '.news-swiper-next',
					prevEl: '.news-swiper-prev',
				}}
				pagination={{
					clickable: true,
				}}
				speed={prefersReducedMotion ? 0 : 650}
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
			<div className="pointer-events-none absolute inset-x-2 top-[calc(16.6667vw-0.3333rem)] z-20 flex -translate-y-1/2 justify-between sm:inset-x-4 lg:top-1/2">
				<button
					aria-label="Previous news item"
					className="news-swiper-prev btn btn-circle btn-ghost pointer-events-auto h-10 min-h-10 w-10 border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-12 sm:min-h-12 sm:w-12"
					type="button"
				>
					<svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
						<path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
					</svg>
				</button>
				<button
					aria-label="Next news item"
					className="news-swiper-next btn btn-circle btn-ghost pointer-events-auto h-10 min-h-10 w-10 border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-12 sm:min-h-12 sm:w-12"
					type="button"
				>
					<svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
						<path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
					</svg>
				</button>
			</div>
		</section>
	);
}
