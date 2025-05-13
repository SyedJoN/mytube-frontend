import React, { createContext, useState, useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { createRootRoute } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import {
  ThemeProvider,
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "../assets/Theme";
import Header from "../Components/Header/Header";
import { getCurrentUser } from "../apis/userFn";
import { throttle } from "lodash";

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
  const home = location.pathname === "/" ;
  const search = location.pathname.startsWith("/search");
  const watch = location.pathname.startsWith("/watch");
  const userProfile = location.pathname.startsWith("/@");
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!(home || search || watch || userProfile));
  const scrollYRef = React.useRef(0);
  const prevScrollRef = React.useRef(0);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isModalOpen = !!document.querySelector('[role="presentation"]');
  
      if (isModalOpen) {
        document.body.style.paddingRight = '0px';
      } else {
        document.body.style.paddingRight = '';
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true, 
    });
  
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    const body = document.body;

    if (open && isLaptop) {
      scrollYRef.current = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`; // Preserve scroll position
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "revert!important"

    } else if (!open && isLaptop) {
      body.style.position = "";
      body.style.top = "";
      body.style.paddingRight = "0!important"
      window.scrollTo(0, prevScrollRef.current); // Restore previous scroll position
    }
  }, [open, isLaptop]);


  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!open) {
        const currentScrollY = window.scrollY;
        scrollYRef.current = currentScrollY;
        prevScrollRef.current = currentScrollY;
      }
    }, 300);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  


  useEffect(() => {
    if (home || search || userProfile) {
      setOpen(true);
    }
  }, [home, search, userProfile]);

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
        userProfile={userProfile}
      />

      <Box
        component="main"
        sx={{
          display: "flex",
          overflowY: "visible",
          marginTop: "var(--toolbar-height)",
          marginLeft:
            isTablet || watch
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
