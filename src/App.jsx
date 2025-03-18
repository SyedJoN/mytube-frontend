import { useState } from "react";
import { ThemeProvider, Typography } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Container from "./Components/Container/Container";
import Sidebar from "./Components/Sidebar"
import theme from "./assets/Theme";
import Header from "./Components/Header/Header";
import "./style.css"; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-wrap content-between">
        <div className="w-full block">
          <Header />
          <Sidebar/>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
