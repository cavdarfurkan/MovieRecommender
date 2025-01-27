"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Basic form validation
		if (!name || !email || !password) {
			setError("All fields are required.");
			setLoading(false);
			return;
		}

		try {
			const response = await axios.post("/api/auth/register", {
				name,
				email,
				password,
			});

			if (response.status === 201) {
				// Registration successful, redirect to sign-in page
				router.push("/auth/signin");
			}
		} catch (err: any) {
			// Handle errors
			if (
				err.response &&
				err.response.data &&
				err.response.data.message
			) {
				setError(err.response.data.message);
			} else {
				setError("An unexpected error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
			<form
				onSubmit={handleSubmit}
				className="bg-white p-6 rounded shadow-md w-full max-w-md"
			>
				<h2 className="text-2xl mb-4 text-center">Register</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<div className="mb-4">
					<label htmlFor="name" className="block mb-1">
						Name
					</label>
					<input
						type="text"
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full border px-3 py-2 rounded"
						placeholder="John Doe"
						required
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="email" className="block mb-1">
						Email
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full border px-3 py-2 rounded"
						placeholder="john@example.com"
						required
					/>
				</div>
				<div className="mb-4">
					<label htmlFor="password" className="block mb-1">
						Password
					</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full border px-3 py-2 rounded"
						placeholder="••••••••"
						required
					/>
				</div>
				<button
					type="submit"
					className={`w-full bg-blue-500 text-white px-3 py-2 rounded ${
						loading
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-blue-600"
					}`}
					disabled={loading}
				>
					{loading ? "Registering..." : "Register"}
				</button>
				<p className="mt-4 text-center">
					Already have an account?{" "}
					<Link
						href="/auth/signin"
						className="text-blue-500 hover:underline"
					>
						Sign In
					</Link>
				</p>
			</form>
		</div>
	);
}
