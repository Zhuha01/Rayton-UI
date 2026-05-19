/**
 * Application root route: renders the router outlet, lazy-loads devtools outside production, and hosts the global 404 fallback.
 * All other routes nest under layouts defined in `routes/_layout`.
 */

import { createRootRoute, Outlet } from "@tanstack/react-router"
import React, { Suspense } from "react"

import NotFound from "@/routes/_layout/NotFound"

const loadDevtools = () =>
  Promise.all([
    import("@tanstack/react-router-devtools"),
    import("@tanstack/react-query-devtools"),
  ]).then(([routerDevtools, reactQueryDevtools]) => {
    return {
      default: () => (
        <>
          {/* <routerDevtools.TanStackRouterDevtools />
          <reactQueryDevtools.ReactQueryDevtools /> */}
        </>
      ),
    }
  })

const TanStackDevtools =
  process.env.NODE_ENV === "production" ? () => null : React.lazy(loadDevtools)

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense>
        <TanStackDevtools />
      </Suspense>
    </>
  ),
  notFoundComponent: () => <NotFound />,
})
