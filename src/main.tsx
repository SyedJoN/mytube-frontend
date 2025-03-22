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
import theme from "./assets/Theme";
import Header from "./Components/Header/Header";
import Home from "./Pages/Home";
import ViewVideo from "./Pages/ViewVideo";
import { useLocation } from "@tanstack/react-router";
import { routeTree } from './routeTree.gen'
import { useMatch } from "react-router-dom";



import './styles.css'; // ✅ Ensure this line exists

// const queryClient = new QueryClient();
// const rootRoute = createRootRoute({
//   component: function Root() {
//     const toggleDrawer = () => setOpen((prev) => !prev)
//     const location = useLocation();
//     const [open, setOpen] = useState(location.pathname === "/");

//     return (
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider theme={theme}>
//           <Box sx={{ display: "flex" }}>
//             <Header
//               open={open}
//               onClose={toggleDrawer}
//               home={location.pathname === "/"}
//             />
//             <Box
//               component="main"
//               sx={{
//                 flexGrow: 1,
//                 backgroundColor: theme.palette.primary.main,
//               }}
//             >
//               <Outlet />
//             </Box>
//           </Box>
//           <TanStackRouterDevtools />
//         </ThemeProvider>
//       </QueryClientProvider>
//     );
//   },
// });

// const indexRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/",
//   component: function Index() {
//     return <Home open={open} />;
//   },
// });

// const watchRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "/watch/$videoId", // ✅ Dynamic route with parameter
//   component: function WatchPage() {
//     return <ViewVideo />;
//   },
// });


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
      <RouterProvider router={router} />
    </StrictMode>
  );
}
