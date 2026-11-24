import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary"],
  webpack: (config, { dev }) => {
    if (dev) {
      // Use filesystem caching instead of holding massive AST/ArrayBuffers in RAM
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [fileURLToPath(import.meta.url)],
        },
      };
    }
    return config;
  },
};

export default nextConfig;
