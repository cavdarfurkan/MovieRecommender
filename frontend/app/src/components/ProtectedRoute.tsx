"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") {
			// TODO: Render a loading spinner here
			return;
		}

		if (!session) {
			router.push("/auth/login");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return <div>Loading...</div>; // Or your custom loading component
	}

	if (session) {
		return <>{children}</>;
	}

	// Optionally, return null or a placeholder while redirecting
	return null;
}
