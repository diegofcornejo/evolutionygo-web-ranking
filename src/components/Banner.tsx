import { useId } from 'react';
import type { News as Props } from '@types';

export default function Banner({ image, title, description, buttonText, buttonLink }: Readonly<Props>) {
	const titleId = useId();
	const hasCta = Boolean(buttonLink && buttonText);

	return (
		<article
			aria-labelledby={titleId}
			className="card not-prose group relative isolate overflow-hidden border border-white/10 bg-base-300 font-sans shadow-2xl lg:min-h-[32rem]"
		>
			<div
				data-banner-media
				className="relative aspect-[3/1] w-full shrink-0 overflow-hidden bg-black/30 lg:absolute lg:inset-0 lg:aspect-auto"
			>
				<img
					alt=""
					aria-hidden="true"
					className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
					decoding="async"
					src={image}
				/>
				<picture className="absolute inset-0 z-10 lg:left-auto lg:w-[72%]">
					<source srcSet={image} type="image/webp" />
					<img
						alt={title}
						className="h-full w-full object-contain object-center transition-[filter] duration-500 motion-safe:group-hover:brightness-110 lg:object-right"
						decoding="async"
						src={image}
					/>
				</picture>
			</div>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-20 hidden bg-gradient-to-r from-base-300 via-base-300/90 to-transparent lg:block"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-2/3 bg-gradient-to-t from-primary/20 to-transparent mix-blend-screen lg:block"
			/>

			<div className="relative z-30 flex flex-1 flex-col justify-center bg-gradient-to-br from-base-300 via-base-300 to-primary/10 p-6 sm:p-8 lg:min-h-[32rem] lg:max-w-[58%] lg:bg-none lg:p-14">
				<div className="mb-4 h-1 w-14 rounded-full bg-primary" />
				<h2
					id={titleId}
					className="text-2xl font-bold leading-tight text-white [text-wrap:balance] sm:text-3xl lg:text-5xl"
				>
					{title}
				</h2>
				<p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 [text-wrap:pretty] sm:text-lg">
					{description}
				</p>

				{hasCta && (
					<div className="mt-7">
						<a
							className="btn btn-primary group/cta w-full border-0 shadow-lg shadow-primary/20 sm:w-auto"
							href={buttonLink}
						>
							{buttonText}
							<svg
								aria-hidden="true"
								className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
							</svg>
						</a>
					</div>
				)}
			</div>
		</article>
	);
}
