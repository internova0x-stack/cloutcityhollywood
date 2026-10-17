import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The build an open page runs, compared with the live one after a deploy (as in Clout City NYC).
  env: { NEXT_PUBLIC_BUILD: process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" },
};

export default nextConfig;
