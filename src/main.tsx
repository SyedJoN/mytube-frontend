import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import theme from "./assets/Theme";
import { routeTree } from "./routeTree.gen";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "./styles.css"; // ✅ Ensure styles are applied

// ✅ Create a QueryClient instance
const queryClient = new QueryClient();

// ✅ Create the router
const router = createRouter({ routeTree });

// ✅ Declare router types for TanStack Router
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
      {/* ✅ Wrap everything inside QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <RouterProvider router={router}>
          </RouterProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
