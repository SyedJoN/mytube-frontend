import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import {
  Container,
  FormControl,
  Input,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { OpenContext } from "../routes/__root";
import { useNavigate, useLocation } from "@tanstack/react-router";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ username, tabPaths }) {
  const [search, setSearch] = React.useState(false);
  const inputRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const currentTabIndex = tabPaths.findIndex((p) =>
    currentPath.includes(`/${p}`)
  );

  const handleChange = (_, newValue) => {
    navigate({ to: `/@${username}/${tabPaths[newValue]}` });
  };

  React.useEffect(() => {
    if (search && inputRef.current) {
      inputRef.current.click();
    }
  }, [search]);

  const handleSearch = () => {
    setSearch(true);
    if (search && inputRef.current) {
      inputRef.current.click();
    }
  };

  // const handleTabSwitch = (tab) => {
  //   if (tab === "posts") {
  //     navigate({
  //       to: `/watch/${videoId}`,
  //     });
  //   }
  // };

  return (
    <Container fixed>
      <Box>
        <Tabs
          value={currentTabIndex === -1 ? 0 : currentTabIndex}
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#f1f1f1",
            },
          }}
          textColor="inherit"
          aria-label="basic tabs example"
        >
          {tabPaths?.map((tab) => (
               <Tab
            disableTouchRipple
            label={tab}
              onClick={() => navigate({ to: `/@${username}/${tab}` })}
            {...a11yProps(0)}
            sx={{
              position: "relative",
              textTransform: "none",
              minWidth: 6,
              color: "#f1f1f1",
              fontSize: "1rem",
              fontWeight: "600",
              padding: "0",
              alignItems: "center",
              marginRight: 3,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "2px",
                width: "100%",
                opacity: 0,
                backgroundColor: "rgba(255,255,255,0.6)",
                transition: "opacity 0.3s ease",
              },
              "&:hover::after": {
                opacity: 1,
              },
            }}
          />
            ))}
        


          <ClickAwayListener onClickAway={() => setSearch(false)}>
            <Tab
              disableRipple
              sx={{ padding: 0, opacity: 1, justifyContent: "start" }}
              icon={
                <>
                  <SearchOutlinedIcon
                    onClick={handleSearch}
                    sx={{
                      fontSize: 28,
                      color: search ? "rgb(255,255,255)" : "#aaa",
                      padding: "0px",
                      opacity: 0.8,
                    }}
                  />
                  {search && (
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <Input
                        placeholder="Search"
                        ref={inputRef}
                        sx={{
                          color: "rgb(255,255,255)",
                          fontSize: "0.875rem",
                          "& textarea": {
                            color: "rgb(255,255,255) !important",
                          },
                          "&::before": {
                            borderBottom: "1px solid #f1f1f1 !important",
                          },
                          "&::after": {
                            borderBottom:
                              "2px solid rgb(255,255,255) !important",
                          },
                          "& input::placeholder": {
                            color: "#f1f1f1",
                            opacity: 0.8,
                          },
                        }}
                      />
                    </FormControl>
                  )}
                </>
              }
            />
          </ClickAwayListener>
        </Tabs>
      </Box>

    </Container>
  );
}
