interface BannerProps {
	image: string;
	title: string;
	description: string;
	buttonText?: string;
	buttonLink?: string;
}

export default ({ image, title, description, buttonText, buttonLink }: BannerProps) => {
	return (
		<div
			className="card bg-base-100 from-base-200 not-prose outline-base-content/5 relative overflow-hidden bg-gradient-to-b font-sans shadow-lg outline -outline-offset-1 md:flex-row-reverse">
			<figure className="max-md:bg-primary/10 isolate shrink-0 md:w-2/3">
				<img className="pointer-events-none w-full aspect-[3/1] object-cover" alt="daisyUI store"
					src={image} />
			</figure>
			<div
				className="bg-accent -left-1/5 pointer-events-none absolute bottom-[-50%] aspect-square w-3/4 -translate-x-1/2 rounded-full opacity-20 blur-3xl">
			</div>
			<div
				className="bg-primary pointer-events-none absolute bottom-[-120%] left-1/2 aspect-square w-full -translate-x-1/2 rounded-full opacity-20 blur-3xl">
			</div>
			<div
				className="bg-base-100 pointer-events-none absolute -top-3/4 right-1/4 z-[3] aspect-square w-1/2 rounded-full opacity-60 blur-3xl">
			</div>
			<div className="card-body relative isolate z-[3]">
				<h2
					className="card-title text-base-content text-xl contrast-200 [text-wrap:balance] sm:w-[250%] sm:text-2xl md:text-4xl lg:text-3xl xl:text-4xl">
					<span>{title}</span>
				</h2>
				<div className="grow">
					<h2 className="card-title text-sm font-light sm:w-[250%] sm:text-lg md:text-lg lg:text-lg xl:text-xl">
						{/* <svg className="inline h-4 w-4 md:h-6 md:w-6" width="32" height="32" viewBox="0 0 415 415" xmlns="http://www.w3.org/2000/svg">
							<rect x="82.5" y="290" width="250" height="125" rx="62.5" fill="#1AD1A5"></rect>
							<circle cx="207.5" cy="135" r="125" fill="white"></circle>
							<circle cx="207.5" cy="135" r="56" fill="#FF9903"></circle>
						</svg> */}
						{description}
					</h2>
				</div>
				{(buttonLink || buttonText) && (
					<a className="btn btn-block btn-primary group" href={buttonLink}>
						{buttonText}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
							className="hidden h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 md:inline-block">
							<path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"></path>
						</svg>
					</a>
				)}
			</div>
		</div>
	);
}
