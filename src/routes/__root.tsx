import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
import { getCurrentUser, getUserChannelProfile } from "../apis/userFn";
import { throttle } from "lodash";
import { SnackbarProvider } from "../Contexts/SnackbarContext";
import { ProgressBar } from "../ProgressBar";

type DrawerContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const DrawerContext = createContext<DrawerContextType | undefined>(
  undefined
);

type UserInteractionContextType = {
  isUserInteracted: boolean;
  setIsUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserInteractionContext = createContext<
  UserInteractionContextType | undefined
>(undefined);

type UserContextType = {
  data?: any;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// 404 Page Component
const NotFoundComponent = () => (
  <Box sx={{ textAlign: "center", mt: 5 }}>
    <h1>404 - Page Not Found</h1>
  </Box>
);

export const Route = createRootRoute({
  component: RouteComponent,
  notFoundComponent: NotFoundComponent,
});

function RouteComponent() {
  const location = useLocation();
  const home = location.pathname === "/";
  const search = location.pathname.startsWith("/search");
  const watch = location.pathname.startsWith("/watch");
  const userProfile = location.pathname.startsWith("/@");
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isCustomWidth = useMediaQuery("(min-width:1284px)");

  const shouldBeOpen = home || search || userProfile;
  const [open, setOpen] = useState(!shouldBeOpen);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const scrollYRef = React.useRef(0);
  const prevScrollRef = React.useRef(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    setOpen(shouldBeOpen);
  }, [shouldBeOpen, hasMounted]);

  useEffect(() => {
    const body = document.body;

    if ((open && isLaptop) || (open && watch)) {
      console.log("true");
      body.style.position = "fixed";
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      body.style.width = "100%";
    } else if ((!open && isLaptop) || (!open && watch)) {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      body.style.width = "";
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const safeScroll = Math.min(scrollYRef.current, maxScroll);

      window.scrollTo(0, safeScroll);
    } else {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      body.style.width = "";
    }
  }, [open, isLaptop, watch]);

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  const drawerValue = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  const userValue = useMemo(() => data || null, [data]);
  const userInteractionValue = useMemo(
    () => ({ isUserInteracted, setIsUserInteracted }),
    [isUserInteracted, setIsUserInteracted]
  );

  const rootStyles = useMemo(
    () => ({
      position: "relative",
      display: "flex",
      overflowY: "visible",
      marginTop: "var(--toolbar-height)",
      marginLeft:
        isTablet || watch
          ? "0"
          : open && !isLaptop
            ? "var(--drawer-width)"
            : !open || !isTablet
              ? "var(--mini-drawer-width)"
              : "0",

      backgroundColor: theme.palette.primary.main,
    }),
    [isTablet, watch, isLaptop, open]
  );
  return (
    <SnackbarProvider>
      <UserInteractionContext.Provider value={userInteractionValue}>
        <UserContext.Provider value={userValue}>
          <DrawerContext.Provider value={drawerValue}>
            <CssBaseline />

            <Header
              open={open}
              home={home}
              search={search}
              watch={watch}
              userProfile={userProfile}
            />

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
