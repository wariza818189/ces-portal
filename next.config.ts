import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep the driver and its runtime dependency graph available to native require.
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
