import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  createRootRoute,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CssBaseline,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { getCurrentUser } from "../apis/userFn";
import throttle from "lodash/throttle";

import Header from "../Components/Header/Header";
import { SnackbarProvider } from "../Contexts/SnackbarContext";
import { ProgressBar } from "../ProgressBar";
import { DrawerContext, UserContext, UserInteractionContext } from "../Contexts/RootContexts";

const NotFoundComponent = () => (
  <Box sx={{ textAlign: "center", mt: 5 }}>
    <h1>404 - Page Not Found</h1>
  </Box>
);

export const Route = createRootRoute({
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
});

function useBodyScrollLock(open: boolean, isLaptop: boolean, watch: boolean) {
  const scrollYRef = useRef(0);
  const prevScrollRef = useRef(0);

  const handleScroll = useCallback(
    throttle(() => {
      if (!open) {
        const scrollY = window.scrollY;
        scrollYRef.current = scrollY;
        prevScrollRef.current = scrollY;
      }
    }, 300),
    [open]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const body = document.body;
    if ((open && isLaptop) || (open && watch)) {
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      body.style.width = "100%";
    } else {
      body.removeAttribute("style");
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(scrollYRef.current, maxScroll));
    }
  }, [open, isLaptop, watch]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}

function RouteComponent() {
  const location = useLocation();
  const home = location.pathname === "/";
  const search = location.pathname.startsWith("/search");
  const watch = location.pathname.startsWith("/watch");
  const userProfile = location.pathname.startsWith("/@");

  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const shouldBeOpen = home || search || userProfile;
  const [open, setOpen] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(shouldBeOpen));
  }, [shouldBeOpen]);

  useBodyScrollLock(open, isLaptop, watch);

  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  const drawerValue = useMemo(() => ({ open, setOpen }), [open]);
  const userValue = useMemo(() => data || null, [data]);
  const userInteractionValue = useMemo(
    () => ({ isUserInteracted, setIsUserInteracted }),
    [isUserInteracted]
  );

  const rootStyles = useMemo(() => {
    const leftMargin =
      isTablet || watch
        ? "0"
        : (home || search || userProfile) && isLaptop
        ? "var(--mini-drawer-width)"
        : open && !isLaptop
        ? "var(--drawer-width)"
        : (!open && !isTablet) || userProfile
        ? "var(--mini-drawer-width)"
        : "0";

    return {
      position: "relative",
      display: "flex",
      overflowY: "visible",
      marginTop: "var(--toolbar-height)",
      marginLeft: leftMargin,
      backgroundColor: theme.palette.primary.main,
    };
  }, [isTablet, watch, isLaptop, open, home, search, userProfile]);

  return (
    <SnackbarProvider>
      <UserInteractionContext.Provider value={userInteractionValue}>
        <UserContext.Provider value={userValue}>
          <DrawerContext.Provider value={drawerValue}>
            <CssBaseline />
            <Header />
            <Box component="main" sx={rootStyles}>
              <ProgressBar />
              <Outlet />
            </Box>
          </DrawerContext.Provider>
        </UserContext.Provider>
      </UserInteractionContext.Provider>
    </SnackbarProvider>
  );
}
