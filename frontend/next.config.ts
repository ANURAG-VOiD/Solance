import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained production server under `.next/standalone` that
  // bundles only the files (and node_modules) actually used at runtime. This
  // lets the Docker image ship without the full dependency tree, keeping the
  // runtime image small and startup fast. See frontend/Dockerfile.
  output: "standalone",
};

export default nextConfig;
