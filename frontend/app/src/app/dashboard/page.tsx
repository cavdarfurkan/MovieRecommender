"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface WatchedMovie {
	id: number;
	movieId: number;
	watchedAt: string;
	movie: {
		id: number;
		title: string;
		poster: string;
		releaseDate: string;
		genre: string;
	};
}

interface Rating {
	id: number;
	movieId: number;
	rating: number;
	ratedAt: string;
	movie: {
		id: number;
		title: string;
		poster: string;
		releaseDate: string;
		genre: string;
	};
}

interface Movie {
	id: number;
	title: string;
	poster: string;
	releaseDate: string;
	genre: string;
}

interface Recommendation {
	id: number;
	title: string;
	genre: string;
	poster: string;
	releaseDate: string;
}

export default function Dashboard() {
	const { data: session, status } = useSession();
	const [watched, setWatched] = useState<WatchedMovie[]>([]);
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [movies, setMovies] = useState<Movie[]>([]);
	const [recommendations, setRecommendations] = useState<Recommendation[]>(
		[]
	);
	const [error, setError] = useState("");

	useEffect(() => {
		if (session) {
			fetchWatched();
			fetchRatings();
			fetchMovies();
			fetchRecommendations();
		}
	}, [session]);

	const fetchWatched = async () => {
		try {
			const res = await axios.get("/api/movies/watched");
			setWatched(res.data);
		} catch (error) {
			setError("Failed to fetch watched movies.");
		}
	};

	const fetchRatings = async () => {
		try {
			const res = await axios.get("/api/movies/ratings");
			setRatings(res.data);
		} catch (error) {
			setError("Failed to fetch ratings.");
		}
	};

	const fetchMovies = async () => {
		try {
			const res = await axios.get("/api/movies");
			setMovies(res.data);
		} catch (error) {
			setError("Failed to fetch movies.");
		}
	};

	const fetchRecommendations = async () => {
		try {
			const userId = session?.user?.id;
			const res = await axios.get("/api/recommendations/${userId}");
			setRecommendations(res.data);
		} catch (error) {
			setError("Failed to fetch recommendations.");
		}
	};

	const handleMarkWatched = async (movieId: number) => {
		try {
			await axios.post("/api/movies/watched", { movieId });
			fetchWatched();
		} catch (error) {
			setError("Failed to mark as watched.");
		}
	};

	const handleRateMovie = async (movieId: number, rating: number) => {
		try {
			await axios.post("/api/movies/ratings", { movieId, rating });
			fetchRatings();
		} catch (error) {
			setError("Failed to rate movie.");
		}
	};

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	// if (!session) {
	// return <div>Please sign in to access your dashboard.</div>;
	// }

	return (
		<ProtectedRoute>
			<div className="min-h-screen p-4">
				<header className="flex justify-between items-center mb-6">
					<h1 className="text-3xl">Dashboard</h1>
					<button
						onClick={() => signOut()}
						className="bg-red-500 text-white px-3 py-1 rounded"
					>
						Sign Out
					</button>
				</header>

				{error && <p className="text-red-500">{error}</p>}

				<section className="mb-6">
					<h2 className="text-2xl mb-4">Mark Movies as Watched</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{movies.map((movie) => (
							<div
								key={movie.id}
								className="bg-white p-4 rounded shadow"
							>
								<h3 className="text-xl">{movie.title}</h3>
								<p className="text-gray-600">
									{movie.genre} | {movie.releaseDate}
								</p>
								<button
									onClick={() => handleMarkWatched(movie.id)}
									className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
								>
									Mark as Watched
								</button>
							</div>
						))}
					</div>
				</section>

				<section className="mb-6">
					<h2 className="text-2xl mb-4">Your Watched Movies</h2>
					{watched.length === 0 ? (
						<p>You haven&apos;t marked any movies as watched.</p>
					) : (
						<ul>
							{watched.map((w) => (
								<li key={w.id} className="mb-2">
									{w.movie.title} - Watched at:{" "}
									{new Date(w.watchedAt).toLocaleString()}
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="mb-6">
					<h2 className="text-2xl mb-4">Rate Movies</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{movies.map((movie) => (
							<div
								key={movie.id}
								className="bg-white p-4 rounded shadow"
							>
								<h3 className="text-xl">{movie.title}</h3>
								<p className="text-gray-600">
									{movie.genre} | {movie.releaseDate}
								</p>
								<div className="mt-2">
									<label className="block mb-1">
										Your Rating:
									</label>
									<select
										onChange={(e) =>
											handleRateMovie(
												movie.id,
												parseInt(e.target.value)
											)
										}
										className="w-full border px-2 py-1 rounded"
										defaultValue=""
									>
										<option value="" disabled>
											Select rating
										</option>
										{[1, 2, 3, 4, 5].map((num) => (
											<option key={num} value={num}>
												{num}
											</option>
										))}
									</select>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="mb-6">
					<h2 className="text-2xl mb-4">Your Ratings</h2>
					{ratings.length === 0 ? (
						<p>You haven&apos;t rated any movies.</p>
					) : (
						<ul>
							{ratings.map((r) => (
								<li key={r.id} className="mb-2">
									{r.movie.title} - Rating: {r.rating} - Rated
									at: {new Date(r.ratedAt).toLocaleString()}
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="mb-6">
					<h2 className="text-2xl mb-4">Recommended for You</h2>
					{recommendations.length === 0 ? (
						<p>No recommendations available.</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{recommendations.map((movie) => (
								<div
									key={movie.id}
									className="bg-white p-4 rounded shadow"
								>
									<h3 className="text-xl">{movie.title}</h3>
									<p className="text-gray-600">
										{movie.genre} | {movie.releaseDate}
									</p>
									{/* Add more details or actions as needed */}
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</ProtectedRoute>
	);
}
