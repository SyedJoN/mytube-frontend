import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import theme from "./assets/Theme";
import Header from "./Components/Header/Header";
import Home from "./Pages/Home";

const drawerWidth = 240;

function App() {
  const [open, setOpen] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Header open={open} setOpen={setOpen} />

        <Box
        
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: open
              ? `${drawerWidth - "70px"}px`
              : `${drawerWidth - "70px"}px`,
            backgroundColor: theme.palette.primary.main,
            padding: "80px 20px",
          }}
        >
          <Home open={open} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
