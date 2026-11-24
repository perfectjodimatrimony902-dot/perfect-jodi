"use client";

import NextLink from "next/link";
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href?: string | object;
  to?: string;
  params?: Record<string, string | number | undefined>;
  search?: Record<string, string | number | boolean | undefined>;
  activeProps?: { className?: string };
  activeOptions?: { exact?: boolean };
  children?: React.ReactNode;
}

export function Link({
  href,
  to,
  params,
  search,
  activeProps,
  activeOptions,
  className = "",
  children,
  ...props
}: LinkProps) {
  const pathname = useNextPathname() || "/";
  let target = href || to || "#";

  if (typeof target === "string") {
    // Replace params like $id, :id, or [id]
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) {
          target = (target as string)
            .replace(`$${k}`, String(v))
            .replace(`:${k}`, String(v))
            .replace(`[${k}]`, String(v));
        }
      });
    }

    if (search) {
      const sp = new URLSearchParams();
      Object.entries(search).forEach(([k, v]) => {
        if (v !== undefined) sp.set(k, String(v));
      });
      const qs = sp.toString();
      if (qs) target = `${target}${target.includes("?") ? "&" : "?"}${qs}`;
    }
  }

  const isExact = activeOptions?.exact ?? false;
  const targetBase = typeof target === "string" ? target.split("?")[0]! : "";
  const isActive = isExact
    ? pathname === targetBase
    : targetBase === "/"
      ? pathname === "/"
      : pathname.startsWith(targetBase);

  const finalClassName = `${className} ${isActive && activeProps?.className ? activeProps.className : ""}`.trim();

  return (
    <NextLink href={target as any} className={finalClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate(opts?: { from?: string }) {
  const router = useNextRouter();
  const currentPathname = useNextPathname() || "/";

  return ({
    to,
    search,
    replace = false,
  }: {
    to?: string;
    search?:
      | Record<string, string | number | boolean | undefined>
      | ((prev: Record<string, any>) => Record<string, any>);
    replace?: boolean;
    resetScroll?: boolean;
  }) => {
    let basePath = (to || opts?.from || currentPathname).split("?")[0]!;
    let url = basePath;
    if (search) {
      let resolvedSearch: Record<string, any> = {};
      if (typeof search === "function") {
        const prev: Record<string, any> = {};
        if (typeof window !== "undefined") {
          const sp = new URLSearchParams(window.location.search);
          sp.forEach((v, k) => {
            prev[k] = v;
          });
        }
        resolvedSearch = search(prev);
      } else {
        resolvedSearch = search;
      }

      const sp = new URLSearchParams();
      Object.entries(resolvedSearch).forEach(([k, v]) => {
        if (v !== undefined && v !== "") sp.set(k, String(v));
      });
      const qs = sp.toString();
      if (qs) url = `${basePath}?${qs}`;
    }

    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };
}

export function useRouter() {
  const nextRouter = useNextRouter();
  return {
    ...nextRouter,
    back: () => nextRouter.back(),
    history: {
      back: () => nextRouter.back(),
    },
    invalidate: () => nextRouter.refresh(),
  };
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useLocation<T = { pathname: string; search: Record<string, string> }>(opts?: {
  select?: (loc: { pathname: string; search: Record<string, string> }) => T;
}): T {
  const pathname = useNextPathname() || "/";
  const nextSearchParams = useNextSearchParams();

  const search = React.useMemo(() => {
    const s: Record<string, string> = {};
    if (nextSearchParams) {
      nextSearchParams.forEach((v, k) => {
        s[k] = v;
      });
    }
    return s;
  }, [nextSearchParams]);

  const loc = { pathname, search };
  if (opts?.select) return opts.select(loc);
  return loc as unknown as T;
}

export function useRouterState<T = any>(opts?: {
  select?: (state: { location: { pathname: string } }) => T;
}): T {
  const pathname = useNextPathname() || "/";
  const state = { location: { pathname } };
  if (opts?.select) return opts.select(state);
  return state as unknown as T;
}

export function useSearch<T = Record<string, any>>(): T {
  const nextSearchParams = useNextSearchParams();

  return React.useMemo(() => {
    const s: Record<string, any> = {};
    if (nextSearchParams) {
      nextSearchParams.forEach((v, k) => {
        s[k] = v;
      });
    }
    return s as T;
  }, [nextSearchParams]);
}

export const Route = {
  useSearch: () => useSearch(),
  useParams: () => useNextParams() || {},
};

export {
  useNextPathname as usePathname,
  useNextSearchParams as useSearchParams,
  useNextParams as useParams,
};
