import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import theme from "./assets/Theme";
import { routeTree } from "./routeTree.gen";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import NProgress from "nprogress";
import "./styles.css"; // your global styles
import { ProgressBar } from "./ProgressBar";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });


declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router}>
            <TanStackRouterDevtools router={router} />
          </RouterProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
