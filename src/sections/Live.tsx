import Marquee from "react-fast-marquee";
import MatchCard from "@components/Cards/MatchCard";

export default function Live() {
	return (
		<Marquee
			className="bg-base-300"
			gradient={true}
			gradientColor={'rgba(142,69,235, 0.5)'}
			gradientWidth={50}
			speed={50}
			pauseOnHover={true}
			autoFill={true}
		>
			<div className="flex gap-2">
				{Array.from({ length: 10 }).map((_, index) => (
					<MatchCard key={index} />
				))}
			</div>
		</Marquee>
	);
}