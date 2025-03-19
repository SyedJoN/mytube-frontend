import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRoute, createRootRoute, createRouter} from "@tanstack/react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"

import App from "./App.jsx";
import Home from "./Pages/Home.jsx";

const queryClient = new QueryClient();

// Root Route
const rootRoute = createRootRoute({
  component: App,
});

// Home Route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute, // Root route ka parent set karna zaroori hai
  path: "/",
  component: Home,
});


const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute]),
});

// Render Router
ReactDOM.createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>

);
