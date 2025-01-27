// import { withAuth } from "next-auth/middleware";

// export default withAuth(
// 	function middleware(req) {
// 		// Custom middleware logic (if any)
// 	},
// 	{
// 		callbacks: {
// 			authorized: (req) => {
// 				// Protect all routes except for /auth/*
// 				if (req.req.nextUrl.pathname.startsWith("/auth")) return true;
// 				return !!req.token;
// 			},
// 		},
// 	}
// );

// // Specify the paths to apply the middleware
// export const config = { matcher: ["/((?!api|_next/static|favicon.ico).*)"] };
