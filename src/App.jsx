import { useState } from "react";
import { ThemeProvider, Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import theme from "./assets/Theme";
import Header from "./Components/Header/Header";  
import Home from "./Components/Home";

const drawerWidth = 240;
const miniDrawerWidth = 65; 

function App() {
  const [open, setOpen] = useState(true);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        {/* Pass `open` and `setOpen` to Header */}
        <Header open={open} setOpen={setOpen} />  

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: open ? `${drawerWidth - '70px'}px` : `${miniDrawerWidth}px`, // Move content
  
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
