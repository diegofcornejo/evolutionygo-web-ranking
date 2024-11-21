import type { News as BannerProps} from '@types';
import { ReactSVG } from 'react-svg'

export default ({ image, title, description, buttonText, buttonLink }: BannerProps) => {
	return (
		<div
			className="card bg-base-100 from-base-200 not-prose outline-base-content/5 relative overflow-hidden bg-gradient-to-b font-sans shadow-lg outline -outline-offset-1 md:flex-row-reverse">
			<figure className="max-md:bg-primary/10 isolate shrink-0 md:w-2/3">
				<img className="pointer-events-none w-full aspect-[3/1] object-cover" alt="Evolution YGO"
					src={image} />
			</figure>
			<div
				className="bg-accent -left-1/5 pointer-events-none absolute bottom-[-50%] aspect-square w-3/4 -translate-x-1/2 rounded-full opacity-20 blur-3xl">
			</div>
			<div
				className="bg-primary pointer-events-none absolute bottom-[-120%] left-1/2 aspect-square w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl">
			</div>
			{/* <div
				className="bg-base-100 pointer-events-none absolute -top-3/4 right-1/4 z-[3] aspect-square w-1/2 rounded-full opacity-60 blur-3xl">
			</div> */}
			<div className="card-body relative isolate z-[3]">
				<h2
					className="card-title text-base-content text-xl contrast-200 [text-wrap:balance] sm:w-[250%] md:w-full sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
					<span>{title}</span>
				</h2>
				<div className="grow">
					<h2 className="card-title text-sm font-light [text-wrap:balance] sm:w-[250%] md:w-full sm:text-lg md:text-lg lg:text-lg xl:text-xl">
						{description}
					</h2>
				</div>
				{(buttonLink && buttonText) && (
					<a className="btn btn-block btn-primary group" href={buttonLink}>
						{buttonText}
						<ReactSVG src='/icons/right-arrow.svg' className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block" />
					</a>
				)}
			</div>
		</div>
	);
}
