"use client";

import { Link } from "@/lib/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold font-display text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold font-display text-foreground">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
