import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import { getCurrentUser, refreshToken } from "../apis/userFn";
import throttle from "lodash/throttle";

import Header from "../Components/Header/Header";
import { SnackbarProvider } from "../Contexts/SnackbarContext";
import { ProgressBar } from "../ProgressBar";
import {
  DrawerContext,
  UserContext,
  UserInteractionContext,
} from "../Contexts/RootContexts";
import { getCurrentUserWithAutoRefresh } from "../helper/getCurrentUserWithAutoRefresh";
import { TimeStampProvider } from "../Contexts/TimeStampProvider";
import { useExitFullscreenOnRouteChange } from "../Components/Utils/ExitFs";
import MobileHeader from "../Components/Header/MobileHeader";
import { useMobileOS } from "../Components/Utils/useMobileOS";
import { DeviceContext } from "../Contexts/DeviceContext";
import { useStateList } from "react-use";

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
  const isMobileWidthDevice = useMediaQuery("(max-width: 414px)")


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
    window.addEventListener("scroll", handleScroll as EventListener);
    return () =>
      window.removeEventListener("scroll", handleScroll as EventListener);
  }, [handleScroll]);

  useEffect(() => {
    const body = document.body;
    if ((open && isLaptop) || (open && watch)) {
      body.style.position = isMobileWidthDevice ? "relative" : "fixed";
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
  }, [open, isLaptop, watch, isMobileWidthDevice]);

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
  const isMobileWidthDevice = useMediaQuery("(max-width: 414px)")

  const queryClient = useQueryClient();
  const channel = new BroadcastChannel("auth_channel");

  const shouldBeOpen = home || search || userProfile;
  const [open, setOpen] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [device, setDevice] = useState<string | undefined>("windows");
  const detectedOS = useMobileOS();

  // Device detection
  useEffect(() => {
    if (detectedOS === "android" || detectedOS === "ios") {
      setDevice("mobile");
    } else {
      setDevice("windows");
    }
  }, [detectedOS, isMobileWidthDevice]);

  // Responsive Header Height
  useEffect(() => {
    const root = document.documentElement;
    if (device === "mobile") {
      root.style.setProperty("--header-height", "48px");
    } else {
      root.style.setProperty("--header-height", "56px");
    }
  }, [device]);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(shouldBeOpen));
  }, [shouldBeOpen]);

  useBodyScrollLock(open, isLaptop, watch);

  const [data, setData] = useState<any>(null);
  const { data: queryData, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    if (queryData !== undefined) {
      setData(queryData);
    }
  }, [queryData]);

  useEffect(() => {
    const hasLoginFlag = document.cookie.includes("login_flag=");
    setAuthenticated(hasLoginFlag);
    if (hasLoginFlag) {
      refetch();
    }
  }, [refetch]);

  useEffect(() => {
    const channel = new BroadcastChannel("auth_channel");

    channel.onmessage = (event) => {
      if (event.data.type === "LOGIN") {
        setAuthenticated(true);
      }
      if (event.data.type === "LOGOUT") {
        setData(null);
        setAuthenticated(false);
        queryClient.clear();
        queryClient.setQueryData(["user"], null);
      }
      queryClient.invalidateQueries({ queryKey: [], exact: false });
    };

    return () => {
      channel.close();
    };
  }, []);

  const silentRefresh = async () => {
    try {
      await refreshToken();
      const userData = await getCurrentUser();
      setData(userData);
    } catch (e) {
      setData(null);
      channel.postMessage({ type: "LOGOUT" });
    }
  };
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      () => {
        silentRefresh();
      },
      15 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [silentRefresh, isAuthenticated]);

  const drawerValue = useMemo(() => ({ open, setOpen }), [open]);
  const userValue = useMemo(() => ({ data, setData }), [data]);
  const userInteractionValue = useMemo(
    () => ({ isUserInteracted, setIsUserInteracted }),
    [isUserInteracted]
  );
  const deviceValue = useMemo(
    () => ({
      device,
      setDevice,
    }),
    [device]
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
      marginTop: "var(--header-height)",
      marginLeft: leftMargin,
      backgroundColor: theme.palette.primary.main,
    };
  }, [isTablet, watch, isLaptop, open, home, search, userProfile]);

  // Exiting Fullscreen on route change
  useExitFullscreenOnRouteChange();

  return (
    <SnackbarProvider>
      <UserInteractionContext.Provider value={userInteractionValue}>
        <UserContext.Provider value={userValue}>
          <DrawerContext.Provider value={drawerValue}>
            <DeviceContext.Provider value={deviceValue}>
              <TimeStampProvider>
                <CssBaseline />
                {device === "mobile" || isMobileWidthDevice ? <MobileHeader /> : <Header />}
                <Box component="main" sx={rootStyles}>
                  <ProgressBar />
                  <Outlet />
                </Box>
              </TimeStampProvider>
            </DeviceContext.Provider>
          </DrawerContext.Provider>
        </UserContext.Provider>
      </UserInteractionContext.Provider>
    </SnackbarProvider>
  );
}
