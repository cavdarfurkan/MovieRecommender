import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import axios from "axios";
import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";

interface Recommendation {
	id: number;
	title: string;
	genre: string;
	releaseYear: number;
}

export default async function Home() {
	const session = await getServerSession(authOptions);

	// if (!session) {
	// 	return <div>Please sign in to see your recommendations.</div>;
	// }

	// Fetch recommendations from FastAPI
	// const user = session.user;
	const userId = 1;
	// const userId = session.user.id;
	const fastApiUrl = `http://localhost:8000/recommendations/${userId}`;
	let recommendations: Recommendation[] = [];

	try {
		// const response = await axios.get(fastApiUrl);
		// recommendations = response.data;
		recommendations = [];
	} catch (error) {
		console.error("Error fetching recommendations:", error);
	}

	return (
		<ProtectedRoute>
			<div className="min-h-screen p-4">
				<h1 className="text-3xl mb-6">Recommended for You</h1>
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
									{movie.genre} | {movie.releaseYear}
								</p>
								{/* Add more details or actions as needed */}
							</div>
						))}
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
}
