import { createTheme, ThemeProvider } from "@mui/material";


const theme = createTheme({
    palette: {
      primary: {
        main: "#0f0f0f",
        hover: "rgba(255,255,255,0.1)"
      },
      secondary: {
        main: "#45f124",
      },
    },
    typography: {
      h1: {
        fontSize: "3rem",
        fontWeight: 600,
      },
      h2: {
        fontSize: "1.75rem",
        fontWeight: 600,
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
      },
    },
    breakpoints: {
      values: {
        xs: 0,   // Mobile screen
        sm: 600, // Small tablets
        md: 960, // Tablets
        lg: 1313, // Laptops
        xl: 1920, // Desktops
      },
    },
  });

export default theme;