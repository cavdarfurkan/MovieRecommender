import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images-na.ssl-images-amazon.com",
			},
			{
				protocol: "https",
				hostname: "placehold.jp",
			},
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	}
};

export default nextConfig;
