import { useId, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import Banner from '@components/Banner.tsx';
import { usePrefersReducedMotion } from '@utils/usePrefersReducedMotion';
import type { News } from '@types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

type AutoplayHandle = Pick<SwiperInstance, 'autoplay'>;

const isOnSlide = (node: EventTarget | null) => node instanceof Element && node.closest('[data-news-slide]') !== null;

// Swiper only pauses autoplay on hover, so a slide could move away while a keyboard user is
// reading its link. Pause while focus is on a slide, and let the visitor stop autoplay outright.
function useAutoplayControl(prefersReducedMotion: boolean) {
	const swiperRef = useRef<AutoplayHandle | null>(null);
	const focusOnSlide = useRef(false);
	const [paused, setPaused] = useState(false);

	const onSwiper = (swiper: AutoplayHandle) => {
		swiperRef.current = swiper;
	};

	const onFocus = (event: FocusEvent<HTMLElement>) => {
		if (prefersReducedMotion || !isOnSlide(event.target)) return;
		focusOnSlide.current = true;
		swiperRef.current?.autoplay?.stop();
	};

	const onBlur = (event: FocusEvent<HTMLElement>) => {
		if (prefersReducedMotion || !focusOnSlide.current || isOnSlide(event.relatedTarget)) return;
		focusOnSlide.current = false;
		if (!paused) swiperRef.current?.autoplay?.start();
	};

	const togglePaused = () => {
		if (paused) {
			setPaused(false);
			if (!focusOnSlide.current) swiperRef.current?.autoplay?.start();
		} else {
			setPaused(true);
			swiperRef.current?.autoplay?.stop();
		}
	};

	return { paused, onSwiper, onFocus, onBlur, togglePaused, showToggle: !prefersReducedMotion };
}

function PauseIcon({ paused }: Readonly<{ paused: boolean }>) {
	return paused ? (
		<svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
			<path d="M8 5.14v14l11-7z" />
		</svg>
	) : (
		<svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
			<path d="M6 5h4v14H6zm8 0h4v14h-4z" />
		</svg>
	);
}

type Variant = 'full' | 'compact';

function CompactNews({ news, prefersReducedMotion }: Readonly<{ news: readonly News[]; prefersReducedMotion: boolean }>) {
	const headingId = useId();
	const autoplay = useAutoplayControl(prefersReducedMotion);
	return (
		<section
			aria-labelledby={headingId}
			className="card flex h-full flex-col overflow-hidden border border-white/10 bg-base-300 shadow-2xl lg:absolute lg:inset-0"
			onBlur={autoplay.onBlur}
			onFocus={autoplay.onFocus}
		>
			<div className="flex items-center justify-between px-5 pt-4">
				<p id={headingId} className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Latest news</p>
				<div className="flex gap-2">
					{autoplay.showToggle && (
						<button
							aria-label={autoplay.paused ? 'Play news' : 'Pause news'}
							className="btn btn-circle btn-ghost btn-sm border border-white/15"
							onClick={autoplay.togglePaused}
							type="button"
						>
							<PauseIcon paused={autoplay.paused} />
						</button>
					)}
					<button aria-label="Previous news item" className="news-compact-prev btn btn-circle btn-ghost btn-sm border border-white/15" type="button">
						<svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
							<path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
						</svg>
					</button>
					<button aria-label="Next news item" className="news-compact-next btn btn-circle btn-ghost btn-sm border border-white/15" type="button">
						<svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
							<path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
						</svg>
					</button>
				</div>
			</div>
			<Swiper
				className="min-h-0 w-full flex-1 [&_.swiper-pagination]:pointer-events-none! [&_.swiper-pagination]:bottom-3! [&_.swiper-pagination-bullet]:pointer-events-auto! [&_.swiper-pagination-bullet]:h-1.5! [&_.swiper-pagination-bullet]:w-4! [&_.swiper-pagination-bullet]:rounded-full! [&_.swiper-pagination-bullet]:bg-base-content/70! [&_.swiper-pagination-bullet]:opacity-100! [&_.swiper-pagination-bullet-active]:w-7! [&_.swiper-pagination-bullet-active]:bg-primary!"
				modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
				slidesPerView={1}
				autoplay={prefersReducedMotion ? false : {
					delay: 6000,
					disableOnInteraction: false,
					pauseOnMouseEnter: true,
				}}
				keyboard={{
					enabled: true,
					onlyInViewport: true,
				}}
				loop={news.length > 1}
				navigation={{
					nextEl: '.news-compact-next',
					prevEl: '.news-compact-prev',
				}}
				pagination={{
					clickable: true,
				}}
				onSwiper={autoplay.onSwiper}
				speed={prefersReducedMotion ? 0 : 500}
			>
				{news.map((newsItem, index) => (
					<SwiperSlide key={newsItem.id}>
						<article aria-labelledby={`news-compact-${newsItem.id}`} className="group relative flex h-full flex-col gap-3 px-5 pt-3 pb-9" data-news-slide>
							<img
								alt=""
								className="aspect-[16/7] w-full rounded-lg object-cover object-right lg:aspect-auto lg:min-h-0 lg:flex-1"
								decoding="async"
								loading={index === 0 ? 'eager' : 'lazy'}
								src={newsItem.image}
							/>
							<h2 id={`news-compact-${newsItem.id}`} className="line-clamp-2 text-xl font-bold leading-7 text-white">
								{newsItem.buttonLink ? (
									<a
										className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
										href={newsItem.buttonLink}
									>
										{newsItem.title}
									</a>
								) : (
									newsItem.title
								)}
							</h2>
							<p className="line-clamp-3 text-sm leading-relaxed text-white/80">{newsItem.description}</p>
						</article>
					</SwiperSlide>
				))}
			</Swiper>
		</section>
	);
}

interface Props {
	/** The carousel entries, read from the evolution-assets news feed (`@utils/newsFeed`). */
	news: readonly News[];
	variant?: Variant;
}

export default function NewsSection({ news, variant = 'full' }: Readonly<Props>) {
	const prefersReducedMotion = usePrefersReducedMotion();
	const autoplay = useAutoplayControl(prefersReducedMotion);
	if (news.length === 0) return null;
	if (variant === 'compact') {
		return <CompactNews news={news} prefersReducedMotion={prefersReducedMotion} />;
	}
	return (
		<section aria-label="Latest news" className="relative mx-4 my-10" onBlur={autoplay.onBlur} onFocus={autoplay.onFocus}>
			<Swiper
				className="pb-10! [&_.swiper-pagination-bullet]:h-1.5! [&_.swiper-pagination-bullet]:w-6! [&_.swiper-pagination-bullet]:rounded-full! [&_.swiper-pagination-bullet]:bg-base-content/70! [&_.swiper-pagination-bullet]:opacity-100! [&_.swiper-pagination-bullet]:transition-all! [&_.swiper-pagination-bullet]:duration-300! [&_.swiper-pagination-bullet-active]:w-10! [&_.swiper-pagination-bullet-active]:bg-primary!"
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
				loop={news.length > 1}
				navigation={{
					nextEl: '.news-swiper-next',
					prevEl: '.news-swiper-prev',
				}}
				pagination={{
					clickable: true,
				}}
				onSwiper={autoplay.onSwiper}
				speed={prefersReducedMotion ? 0 : 650}
			>
				{news.map((newsItem) => (
					<SwiperSlide key={newsItem.id}>
						<div className="h-full" data-news-slide>
							<Banner
								id={newsItem.id}
								image={newsItem.image}
								title={newsItem.title}
								description={newsItem.description}
								buttonLink={newsItem.buttonLink}
								buttonText={newsItem.buttonText}
							/>
						</div>
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
			{autoplay.showToggle && (
				<button
					aria-label={autoplay.paused ? 'Play news' : 'Pause news'}
					className="btn btn-circle btn-ghost btn-sm absolute bottom-0 right-2 z-20 border border-white/15 bg-black/45 text-white sm:right-4"
					onClick={autoplay.togglePaused}
					type="button"
				>
					<PauseIcon paused={autoplay.paused} />
				</button>
			)}
		</section>
	);
}
