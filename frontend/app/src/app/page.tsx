/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import MovieCard from "@/components/MovieCard";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Recommendation {
	id: number;
	title: string;
	genre: string;
	releaseDate: string;
	poster_url: string;
}

export default function Home() {
	const { data: session, status } = useSession();
	const [recommendations, setRecommendations] = useState<Recommendation[]>(
		[]
	);
	const [error, setError] = useState("");
	const recommendationsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (session) {
			fetchRecommendations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			console.error(error);
			setError("Failed to fetch recommendations.");
		}
	};

	const scroll = (direction: "left" | "right") => {
		if (recommendationsRef.current) {
			const scrollAmount = 300;
			recommendationsRef.current.scrollBy({
				top: 0,
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen p-4">
				<section className="mb-6">
					<h2 className="text-2xl mb-4 flex items-center justify-between">
						Recommended Movies
						<div>
							<button
								onClick={() => scroll("left")}
								className="mr-2 bg-gray-300 text-gray-700 px-2 py-1 rounded"
							>
								&#8592;
							</button>
							<button
								onClick={() => scroll("right")}
								className="bg-gray-300 text-gray-700 px-2 py-1 rounded"
							>
								&#8594;
							</button>
						</div>
					</h2>
					{error && <p className="text-red-500 mb-4">{error}</p>}
					{!session ? (
						<p>Please sign in to see your recommendations.</p>
					) : (
						<div
							ref={recommendationsRef}
							className="flex space-x-4 overflow-x-auto scroll-smooth"
						>
							{recommendations.length === 0 ? (
								<p>No recommendations available.</p>
							) : (
								recommendations.map((movie) => (
									<MovieCard key={movie.id} movie={movie} />
								))
							)}
						</div>
					)}
				</section>
			</div>
		</ProtectedRoute>
	);
}
