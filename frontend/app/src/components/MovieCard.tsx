import Image from "next/image";
import { useState } from "react";

interface MovieCardProps {
	movie: Movie & {
		rating?: number;
	};
	onRateMovie?: (rating: number) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRateMovie }) => {
	const [rating, setRating] = useState(movie.rating || 0);
	const [hover, setHover] = useState(0);

	const handleRating = (value: number) => {
		setRating(value);
		if (onRateMovie) {
			onRateMovie(value);
		}
	};

	return (
		<div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 p-3 w-64 flex-shrink-0">
			<div className="relative">
				<Image
					src={movie.poster_url}
					alt={movie.title}
					className="w-full h-64 object-cover mb-2 rounded dark:text-gray-700"
					width={500}
					height={750}
				/>
			</div>
			<div className="p-3 h-32 flex flex-col justify-between">
				<div className="">
					<h3 className="text-lg font-semibold text-gray-800 dark:text-gray200 dark:text-black truncate">
						{movie.title}
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray400 dark:text-black mb-2">
						{movie.genre} | {movie.releaseDate}
					</p>
				</div>
				<div className="flex items-center mt-auto">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							onClick={() => handleRating(star)}
							onMouseEnter={() => setHover(star)}
							onMouseLeave={() => setHover(0)}
							className="focus:outline-none"
						>
							<svg
								className={`w-5 h-5 ${
									star <= (hover || rating)
										? "text-yellow-400"
										: "text-gray-300"
								} transition-colors duration-150`}
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						</button>
					))}
					<span className="ml-2 text-sm text-gray-600">
						{rating > 0 ? `${rating}/5` : "Not rated"}
					</span>
				</div>
			</div>
		</div>
	);
};

export default MovieCard;
