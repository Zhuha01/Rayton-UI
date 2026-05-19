import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import "@fontsource/inter/index.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import { Center, Spinner } from "@chakra-ui/react"
import { StrictMode, Suspense } from "react"
import ReactDOM from "react-dom/client"
import { ApiError, OpenAPI } from "./client"
import { CustomProvider } from "@/components_2/ui/Provider"
import "./i18n"
import { routeTree } from "./routeTree.gen"

//OpenAPI.BASE = import.meta.env. VITE_API URL Додати при передачі

// видалити нижні 3 строки при передачі
OpenAPI.BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "")

OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({
  routeTree,
  /* На iPhone Chrome збереження скролу в sessionStorage іноді «бореться» з вкладеним скролом і дає смикання.
     Скидання робимо вручну в _layout (+ scrollToTopSelectors після рендеру роутера). */
  scrollRestoration: false,
  scrollToTopSelectors: ['[data-scroll-restoration-id="layout-main"]'],
})
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <Center minH="100dvh">
              <Spinner size="xl" color="ui.Interactive.accent" />
            </Center>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </CustomProvider>
  </StrictMode>,
)
