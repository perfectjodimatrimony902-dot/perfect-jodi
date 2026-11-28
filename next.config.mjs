import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
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
