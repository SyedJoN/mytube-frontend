import React, { createContext, useState, useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { createRootRoute } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { ThemeProvider, Box, CssBaseline, useTheme, useMediaQuery } from "@mui/material";
import theme from "../assets/Theme";
import Header from "../Components/Header/Header";
import { getCurrentUser } from "../apis/userFn";

// Context for managing drawer state
type OpenContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: any;
};
export const OpenContext = createContext<OpenContextType | undefined>(
  undefined
);

// 404 Page Component
const NotFoundComponent = () => (
  <Box sx={{ textAlign: "center", mt: 5 }}>
    <h1>404 - Page Not Found</h1>
  </Box>
);

// ✅ Define and Export `Route`
export const Route = createRootRoute({
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
});

function RouteComponent() {
  const location = useLocation();
  const home = location.pathname === "/";
  const search = location.pathname.startsWith("/search");
  const watch = location.pathname.startsWith("/watch");
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!(home || search || watch));

 useEffect(() => {
  if ((home) || search || location.pathname.startsWith("/@")) {
    setOpen(true);
  } 
}, [home, search, location.pathname]);

  const toggleDrawer = () => setOpen((prev) => !prev);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  console.log(data);
  console.log("✅ OpenContext.Provider is wrapping the app");

  return (
    // ✅ Wrap everything inside QueryClientProvider

      <OpenContext.Provider value={{ open, setOpen, data: data || null }}>
        <CssBaseline />

        <Header
          open={open}
          onClose={toggleDrawer}
          home={home}
          search={search}
          watch={watch}
        />

        <Box
          component="main"
          sx={{
            marginTop: "var(--toolbar-height)",
            marginLeft: (isTablet || watch)
            ? "0" // If it's a mobile device, set marginLeft to 0
            : open && !isLaptop
            ? "var(--drawer-width)" // When open and not tablet, and not watching
            : !open || !isTablet
            ? "var(--mini-drawer-width)" // If not watching and not mobile
            : "0", // Default to 0
          
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <Outlet />
        </Box>
      </OpenContext.Provider>

  );
}
