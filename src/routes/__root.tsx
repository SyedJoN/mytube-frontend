import React, { StrictMode, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  Link,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, Box } from "@mui/material";
import theme from "../assets/Theme";
import Header from "../Components/Header/Header";
import Home from "../Pages/Home";
import ViewVideo from "../Pages/ViewVideo";
import { useLocation } from "@tanstack/react-router";
import { createContext } from "react";

const queryClient = new QueryClient();

type OpenContextType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  
export const OpenContext = createContext<OpenContextType | undefined>(undefined);

const NotFoundComponent = () => (
  <Box sx={{ textAlign: "center", mt: 5 }}>
    <h1>404 - Page Not Found</h1>
    <Link to="/">Go Home</Link>
  </Box>
);
export const Route = createRootRoute({
  component: function Root() {
    const toggleDrawer = () => setOpen((prev) => !prev);
    const location = useLocation();
    const [open, setOpen] = useState(location.pathname === "/");

    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
        <OpenContext.Provider value={{ open, setOpen }}>
          <Box sx={{ display: "flex" }}>
            <Header
              open={open}
              onClose={toggleDrawer}
              home={location.pathname === "/"}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <Outlet />
            </Box>
          </Box>
          </OpenContext.Provider>
          <TanStackRouterDevtools />
        </ThemeProvider>
      </QueryClientProvider>
    );
  },
  notFoundComponent: NotFoundComponent,
});
