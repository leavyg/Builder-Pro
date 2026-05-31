import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next doesn't pick up the stray
  // lockfile in the home directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
