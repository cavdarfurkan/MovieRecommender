"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session) {
			router.push("/dashboard");
		}
	}, [session, router]);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Basic form validation
		if (!email || !password) {
			setError("Both email and password are required.");
			setLoading(false);
			return;
		}

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (result?.error) {
				setError(result.error);
			} else {
				// Sign-in successful, redirect to dashboard
				router.push("/dashboard");
			}
		} catch (err) {
			console.error(err);
			setError("An unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
			<form
				onSubmit={handleSubmit}
				className="bg-white dark:bg-gray-700 p-6 rounded shadow-md w-full max-w-md"
			>
				<h2 className="text-2xl mb-4 text-center">Sign In</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<div className="mb-4">
					<label htmlFor="email" className="block mb-1">
						Email
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full border px-3 py-2 rounded dark:text-black"
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
						className="w-full border px-3 py-2 rounded dark:text-black"
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
					{loading ? "Signing In..." : "Sign In"}
				</button>
				<p className="mt-4 text-center">
					Don&apos;t have an account?{" "}
					<Link
						href="/auth/register"
						className="text-blue-500 hover:underline"
					>
						Register
					</Link>
				</p>
			</form>
		</div>
	);
}
