import Image from "next/image";

interface MovieCardProps {
	movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => (
	<div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 p-4 w-64 flex-shrink-0">
		<div className="relative">
			<Image
				src={movie.poster_url}
				alt={movie.title}
				className="w-full h-64 object-cover mb-2 rounded"
				width={500}
				height={750}
			/>
		</div>
		<div className="p-4">
			<h3 className="text-lg font-semibold text-gray-800 dark:text-gray200 dark:text-black truncate">
				{movie.title}
			</h3>
			<p className="text-sm text-gray-600 dark:text-gray400 dark:text-blac">
				{movie.genre} | {movie.releaseDate}
			</p>
		</div>
	</div>
);

export default MovieCard;
