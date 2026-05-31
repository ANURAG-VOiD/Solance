import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Production guard: fail the build if NEXT_PUBLIC_API_URL still points at
// localhost in a production build.  This prevents accidentally shipping a
// bundle that calls http://localhost:8080 from a user's browser.
// ---------------------------------------------------------------------------
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_API_URL &&
  process.env.NEXT_PUBLIC_API_URL.includes("localhost")
) {
  throw new Error(
    `NEXT_PUBLIC_API_URL contains "localhost" (${process.env.NEXT_PUBLIC_API_URL}) ` +
      `but NODE_ENV is "production". Set NEXT_PUBLIC_API_URL to your production ` +
      `API origin (e.g. https://api.your-domain.com).`,
  );
}

const nextConfig: NextConfig = {
  // Emit a self-contained production server under `.next/standalone` that
  // bundles only the files (and node_modules) actually used at runtime. This
  // lets the Docker image ship without the full dependency tree, keeping the
  // runtime image small and startup fast. See frontend/Dockerfile.
  output: "standalone",
};

export default nextConfig;
