import React, { createContext, useState, useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createRootRoute } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { ThemeProvider, Box, CssBaseline } from "@mui/material";
import theme from "../assets/Theme";
import Header from "../Components/Header/Header";
import { getCurrentUser } from "../apis/userFn";


// Context for managing drawer state
type OpenContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: any; 
};
export const OpenContext = createContext<OpenContextType | undefined>(undefined);

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
  const search = location.pathname.startsWith("/search/");
  const watch = location.pathname.startsWith("/watch/");

  const [open, setOpen] = useState(!(home || search || watch));

  useEffect(() => {
    if (home || search || watch) {
      setOpen(false);
    }
  }, [home, search, watch]);
  
  const toggleDrawer = () => setOpen((prev) => !prev);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
  

  
  
  console.log(data);
  

  return (
    // ✅ Wrap everything inside QueryClientProvider
      <ThemeProvider theme={theme}>
      <OpenContext.Provider value={{ open, setOpen, data: data || null }}>

          <CssBaseline />
          
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Header open={open} onClose={toggleDrawer} home={home} search={search} watch={watch} />
            <Box component="main" sx={{ flexGrow: 1, backgroundColor: theme.palette.primary.main }}>
              <Outlet />
            </Box>
          </Box>
        </OpenContext.Provider>
      </ThemeProvider>
  );
}
