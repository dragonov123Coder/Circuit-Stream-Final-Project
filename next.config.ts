import type { NextConfig } from "next";


const repoName = "Circuit-Stream-Final-Project"; // Change to your repo name if different

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
};

export default nextConfig;
