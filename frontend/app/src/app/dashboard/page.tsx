"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import MovieCard from "@/components/MovieCard";

// interface Movie {
// 	id: number;
// 	title: string;
// 	poster_url: string;
// 	releaseDate: string;
// 	genre: string;
// }

interface Recommendation {
	id: number;
	title: string;
	genre: string;
	releaseDate: string;
	poster_url: string;
}

export default function Dashboard() {
	const { data: session, status } = useSession();
	const [recommendations, setRecommendations] = useState<Recommendation[]>(
		[]
	);
	const [moviesByGenre, setMoviesByGenre] = useState<{
		[key: string]: Movie[];
	}>({});
	const [error, setError] = useState("");

	const genres = [
		{ id: 1, name: "unknown" },
		{ id: 2, name: "Action" },
		{ id: 3, name: "Adventure" },
		{ id: 4, name: "Animation" },
		{ id: 5, name: "Children's" },
		{ id: 6, name: "Comedy" },
		{ id: 7, name: "Crime" },
		{ id: 8, name: "Documentary" },
		{ id: 9, name: "Drama" },
		{ id: 10, name: "Fantasy" },
		{ id: 11, name: "Film-Noir" },
		{ id: 12, name: "Horror" },
		{ id: 13, name: "Musical" },
		{ id: 14, name: "Mystery" },
		{ id: 15, name: "Romance" },
		{ id: 16, name: "Sci-Fi" },
		{ id: 17, name: "Thriller" },
		{ id: 18, name: "War" },
		{ id: 19, name: "Western" },
	];

	useEffect(() => {
		if (session) {
			fetchRecommendations();
			fetchMoviesByGenre();
		}
	}, [session]);

	const fetchRecommendations = async () => {
		try {
			if (session) {
				const userId = session.user.id;
				const res = await axios.get(
					`http://localhost:8000/recommendations/${userId}`,
					{
						params: { top_n: 10 },
					}
				);

				const mappedRecommendations = res.data.map((item: any) => ({
					id: item.movie.movie_id,
					title: item.movie.movie_title,
					genre: item.movie.genres,
					releaseDate: item.movie.release_date,
					poster_url: item.movie.poster_url,
				}));
				setRecommendations(mappedRecommendations);
			}
		} catch (error) {
			setError("Failed to fetch recommendations.");
		}
	};

	const fetchMoviesByGenre = async () => {
		try {
			const genresData: { [key: string]: Recommendation[] } = {};

			for (const genre of genres) {
				if (genre.name === "unknown") {
					continue;
				}

				if (session) {
					const userId = session.user.id;
					const res = await axios.get(
						`http://localhost:8000/recommendations/genre/${genre.id}`,
						{
							params: { user_id: userId, top_n: 10 },
						}
					);

					const mappedMovies = res.data.map((item: any) => ({
						id: item.movie.movie_id,
						title: item.movie.movie_title,
						genre: item.movie.genres,
						releaseDate: item.movie.release_date,
						poster_url: item.movie.poster_url,
					}));

					genresData[genre.name] = mappedMovies;
				} else {
					const res = await axios.get(
						`http://localhost:8000/recommendations/genre/${genre.id}`,
						{
							params: { limit: 10 },
						}
					);

					const mappedMovies = res.data.map((item: any) => ({
						id: item.movie_id,
						title: item.movie_title,
						genre: item.genres,
						releaseDate: item.release_date,
						poster_url: item.poster_url,
					}));

					genresData[genre.name] = mappedMovies;
				}
			}
			setMoviesByGenre(genresData);
		} catch (error) {
			setError("Failed to fetch movies by genre.");
		}
	};

	const handleRateMovie = async (movieId: number, rating: number) => {
		try {
			const session = await getSession();

			if (!session?.user?.id) {
				throw new Error("User not authenticated");
			}

			const response = await axios.post("http://localhost:8000/ratings", {
				user_id: session.user.id,
				movie_id: movieId,
				rating: rating,
			});

			if (response.status === 200) {
				// Handle successful rating (e.g., show toast notification)
				console.log("Movie rated successfully");
			}
		} catch (error) {
			// Handle error (e.g., show error message)
			console.error("Error rating movie:", error);
		}
	};

	const recommendationsRef = useRef<HTMLDivElement>(null);
	const genreRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	const scroll = (
		ref: React.RefObject<HTMLDivElement>,
		direction: "left" | "right"
	) => {
		if (ref.current) {
			const scrollAmount = 300;
			ref.current.scrollBy({
				top: 0,
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<ProtectedRoute>
			<div className="min-h-screen p-4">
				<header className="flex justify-between items-center mb-6 bg-gray-100 dark:bg-neutral-800 p-4 rounded">
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
					<h2 className="text-2xl mb-4 flex items-center justify-between">
						Recommended for You
						<div>
							<button
								onClick={() =>
									scroll(recommendationsRef, "left")
								}
								className="mr-2 bg-gray-300 text-gray-700 px-2 py-1 rounded"
							>
								&#8592;
							</button>
							<button
								onClick={() =>
									scroll(recommendationsRef, "right")
								}
								className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
							>
								&#8594;
							</button>
						</div>
					</h2>
					<div
						ref={recommendationsRef}
						className="flex space-x-4 overflow-x-auto scroll-smooth"
					>
						{recommendations.map((movie) => (
							<MovieCard
								key={movie.id}
								movie={movie}
								onRateMovie={(rating) =>
									handleRateMovie(movie.id, rating)
								}
							/>
						))}
					</div>
				</section>

				{genres.map(
					(genre) =>
						genre.id !== 1 && (
							<section key={genre.id} className="mb-6">
								<h2 className="text-2xl mb-4 flex items-center justify-between">
									{genre.name} Movies
									<div>
										<button
											onClick={() =>
												scroll(
													{
														current:
															genreRefs.current[
																genre.name
															],
													},
													"left"
												)
											}
											className="mr-2 bg-gray-300 text-gray-700 px-2 py-1 rounded"
										>
											&#8592;
										</button>
										<button
											onClick={() =>
												scroll(
													{
														current:
															genreRefs.current[
																genre.name
															],
													},
													"right"
												)
											}
											className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
										>
											&#8594;
										</button>
									</div>
								</h2>
								<div
									ref={(el) =>
										(genreRefs.current[genre.name] = el)
									}
									className="flex space-x-4 overflow-x-auto"
								>
									{moviesByGenre[genre.name]?.map((movie) => (
										<MovieCard
											key={movie.id}
											movie={movie}
											onRateMovie={(rating) =>
												handleRateMovie(
													movie.id,
													rating
												)
											}
										/>
									))}
								</div>
							</section>
						)
				)}
			</div>
		</ProtectedRoute>
	);
}
