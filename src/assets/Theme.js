import { createTheme, ThemeProvider } from "@mui/material";


const theme = createTheme({
    
    palette: {
        primary: {
            main: "#0f0f0f"
        },
        secondary: {
            main: "#45f124"
        },

    },
    typography: {
        h1: {
            fontSize: '3rem',
            fontWeight: 600
        },
        h2: {
            fontSize: '1.75rem',
            fontWeight: 600
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600
        },
      
    }
})

export default theme;