import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Container, FormControl, Input } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";

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

export default function BasicTabs() {
  const [search, setSearch] = React.useState(false);
  const inputRef = React.useRef(null);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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

  return (
    <Box sx={{ marginX: `calc(50% - 642px)` }}>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            borderBottom: 1,
            borderColor: "rgba(255,255,255,0.2)",
            "& .MuiTabs-indicator": {
              backgroundColor: "#f1f1f1",
            },
          }}
          textColor="inherit"
          aria-label="basic tabs example"
        >
          <Tab
            disableTouchRipple
            label="Videos"
            {...a11yProps(0)}
            sx={{
              position: "relative",
              textTransform: "none",
              color: "#f1f1f1",
              fontSize: "1rem",
              fontWeight: "600",
              padding: "0",
              alignItems: "center",
            }}
          />

          <Tab
            disableTouchRipple
            label="Playlist"
            {...a11yProps(0)}
            sx={{
              position: "relative",
              textTransform: "none",
              color: "#f1f1f1",
              fontSize: "1rem",
              fontWeight: "600",
              padding: "0",
              alignItems: "center",
            }}
          />

          <ClickAwayListener onClickAway={() => setSearch(false)}>
            <Tab
              disableRipple
              sx={{ padding: 0, opacity: 1 }}
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

      <CustomTabPanel index={0}>Item One</CustomTabPanel>
    </Box>
  );
}
