import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Whatsapp from "../Svgs/Whatsapp.jsx";
import Facebook from "../Svgs/Facebook.jsx";
import X from "../Svgs/X.jsx";
import { Typography } from "@mui/material";
import Mail from "../Svgs/Mail.jsx";
import Reddit from "../Svgs/Reddit.jsx";
import LinkedIn from "../Svgs/LinkedIn.jsx";
import Pinterest from "../Svgs/Pinterest.jsx";

export default function ScrollableTabsButton({ shareUrl }) {
  console.log("In ScrollableTabsButtonAuto →", shareUrl);
  const [value, setValue] = React.useState(0);

  const handleClick = (platform) => {
    const encodedText = encodeURIComponent(`Check this out: ${shareUrl}`);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent("Check this out!");

    if (platform === "whatsapp") {
      window.open(
        `https://web.whatsapp.com/send?text=${encodedText}`,
        "_blank"
      );

    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        "_blank"
      );

    } else if (platform === "x") {
      window.open(
        `https://X.com/intent/tweet?text=${encodedText}`,
        "_blank"
      );

    } else if (platform === "mail") {
      const subject = encodeURIComponent("Check this out!");
      const body = encodeURIComponent(`Hey,\n\nCheck this out: ${shareUrl}`);
      window.open(`mailto:?subject=${subject}&body=${body}`, "_self");

    } else if (platform === "reddit") {
      window.open(
        `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        "_blank"
      );
    } else if (platform === "linkedin") {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      window.open(linkedInUrl, "_blank");
    }
  };

  return (
    <Box sx={{ maxWidth: { xs: 320, sm: 480 }, overflow: "hidden" }}>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          ".MuiTabs-flexContainer": {
            alignItems: "center",
          },
          // LEFT arrow
          ".MuiTabs-scrollButtons.Mui-disabled:first-of-type": {
            visibility: "visible", // force show even if disabled
          },
          ".MuiTabs-scrollButtons": {
            position: "absolute",
            top: "72px",
            zIndex: 99,
            backgroundColor: "#212121!important",
            boxShadow: "0 4px 4px rgba(0,0,0,.3),0 0 4px rgba(0,0,0,.2)",
            borderRadius: "50px",
            width: "40px",
            height: "40px",
          },
          ".MuiTabs-scrollButtons:first-of-type": {
            left: "13px", // <-- LEFT arrow
          },
          ".MuiTabs-scrollButtons:last-of-type": {
            right: "13px", // <-- RIGHT arrow
          },
          ".MuiTabs-scrollButtons:not(.Mui-disabled)": {
            opacity: "1 !important", // Make sure the enabled button has opacity of 1
          },
        }}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="scrollable auto tabs example"
        indicatorColor="transparent"
        textColor="#f1f1f1"
      >
        <Tab
          onClick={() => handleClick("whatsapp")}
          icon={<Whatsapp size={62} />}
          label="Whatsapp"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          onClick={() => handleClick("facebook")}
          icon={<Facebook size={62} />}
          label="Facebook"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          onClick={() => handleClick("x")}
          icon={<X size={62} />}
          label="X"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          onClick={() => handleClick("mail")}
          icon={<Mail size={62} />}
          label="Mail"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          onClick={() => handleClick("reddit")}
          icon={<Reddit size={62} />}
          label="Reddit"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
        <Tab
          onClick={() => handleClick("linkedin")}
          icon={<LinkedIn size={62} />}
          label="LinkedIn"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
          <Tab
          onClick={() => handleClick("pinterest")}
          icon={<Pinterest size={62} />}
          label="Pinterest"
          sx={{
            minHeight: 72,
            minWidth: 72,
            padding: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.75rem",
          }}
        />
      </Tabs>
    </Box>
  );
}
