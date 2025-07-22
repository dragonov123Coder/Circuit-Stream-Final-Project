import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "Circuit-Stream-Final-Project";
const nextConfig: NextConfig = {
  ...(isProd && {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),
  /* config options here */
};

export default nextConfig;