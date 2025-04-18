import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSubscription } from "../apis/subscriptionFn";
import Button from "@mui/material/Button";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { keyframes, positions } from "@mui/system";
import { getUserChannelProfile } from "../apis/userFn";
import AlertDialog from "./Dialog";
import SimpleSnackbar from "./Snackbar";
import Box from "@mui/system/Box";
import Signin from "./Signin";
import SignInAlert from "./SignInAlert";

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(-15deg); }
  20% { transform: rotate(15deg); }
  30% { transform: rotate(-10deg); }
  40% { transform: rotate(10deg); }
  50% { transform: rotate(-8deg); }
  60% { transform: rotate(8deg); }
  70% { transform: rotate(0deg); }
  80% { transform: rotate(0deg); }
  90% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

export const SubscribeButton = React.memo(
  ({
    isAuthenticated,
    channelName,
    channelId,
    userData,
    initialSubscribed,
    initialSubscribers,
    user,
    activeAlertId,
    setActiveAlertId,
  }) => {
    const currentAlertId = `alert-${channelId}`;
    const paperOpen = activeAlertId === currentAlertId;

    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSignIn, setIsSignIn] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(initialSubscribers);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [showGradient, setShowGradient] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const buttonRef = useRef(null);
    const timeoutIdRef = useRef(null); 
    const queryClient = useQueryClient();

    const buttonStyles = {
      base: {
        position: "relative",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50px",
        height: "36px",
        fontSize: "0.8rem",
        padding: 0,
        textTransform: "capitalize",
        fontWeight: "600",
        transition: "width 0.5s ease, background 0.3s ease",
        overflow: "hidden",
        marginLeft: "8px",
        width: isSubscribed ? "130px" : "100px",
      },
      before: {
        content: '""',
        position: "absolute",
        height: "100%",
        zIndex: 0,
        width: "100%",
        background:
          "linear-gradient(135deg, rgba(252, 38, 173, 0.99), rgba(255, 0, 187, 0.71))",
        transition: "opacity 0.1s ease-out", // Quick fade out
        opacity: showGradient ? 1 : 0,
      },
    };

    const handleTransitionEnd = () => {
      if (isSubscribed) {
        setShowGradient(false);
      }
    };

    const handleSubscribeBtn = (e) => {
      e.stopPropagation();

      if (isAuthenticated && isSubscribed) {
        setDialogOpen(true);
      } else if (isAuthenticated && !isSubscribed) {
        mutate();
      } else {
        setActiveAlertId(paperOpen ? null : currentAlertId);
      }
    };

    useEffect(() => {
      if (!userData?.data?.length) return;

      const newValue = userData.data[0]?.isSubscribedTo ?? false;
      const newCount = userData.data[0]?.subscribersCount ?? 0;

      setIsSubscribed(newValue);
      setSubscriberCount(newCount);

      if (!hasLoaded) {
        setHasLoaded(true); // ✅ Ready to render now
      }
    }, [userData]);

    const { mutate, isLoading } = useMutation({
      mutationFn: () => toggleSubscription(channelId),
      onMutate: () => {
        const isSubscribing = !isSubscribed;
    
        if (isSubscribing) {
          setShowGradient(true);
        }
    
        setIsSubscribed(isSubscribing);
        setSubscriberCount((prev) => prev + (isSubscribing ? 1 : -1));
    
        setShouldAnimate(false);
    
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
    
        timeoutIdRef.current = setTimeout(() => {
          setShouldAnimate(true); 
        }, 500); 
    
        if (!isSubscribing) {
          setShouldAnimate(false);
        }
      },
    
      onSuccess: (data) => {
        queryClient.invalidateQueries(["channelProfile", user]);
        !isSubscribed
          ? setSnackbarMessage("Subscription removed")
          : setSnackbarMessage("Subscription added");
        setSnackbarOpen(true);
      },
    });
    
    useEffect(() => {
      if (!userData?.data?.length) return;
      const newValue = userData?.data[0]?.isSubscribedTo ?? false;
      if (isSubscribed !== newValue) {
        setIsSubscribed(newValue); // ✅ Only update if different
      }
      const newCount = userData.data[0]?.subscribersCount ?? 0;
      if (subscriberCount !== newCount) {
        setSubscriberCount(newCount);
      }
    }, [userData]);

    const handleCloseAlert = () => {
      if (paperOpen) setActiveAlertId(null);
    };

    return (
      <>
        {isSignIn && (
          <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
            <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
          </Box>
        )}
        <AlertDialog
          title={`Unsubscribe from ${channelName}?`}
          buttonTxt="Unsubscribe"
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onConfirm={() => mutate()}
        />
        <SimpleSnackbar
          open={snackbarOpen}
          setOpen={setSnackbarOpen}
          message={snackbarMessage}
        />
        <Box>
          {hasLoaded && (
            <Button
              ref={buttonRef}
              onClick={handleSubscribeBtn}
              onTransitionEnd={handleTransitionEnd}
              sx={{
                borderRadius: "50px",
                position: "relative",
                height: "36px",
                fontSize: "0.8rem",
                textTransform: "capitalize",
                overflow: "hidden",
                fontWeight: "600",
                marginLeft: "16px",
                padding: "0 16px",
                width: isSubscribed ? "140px" : "100px",
                background: isSubscribed ? "rgba(255,255,255,0.1)" : "#f1f1f1",
                transition: isSubscribed
                  ? "width 0.5s ease, background 0.3s ease"
                  : "",
                "&:hover": {
                  background: isSubscribed
                    ? "rgba(255,255,255,0.2)"
                    : "#d9d9d9",
                },
                "&::before": {
                  ...buttonStyles.before,
                  opacity: isSubscribed && showGradient ? 1 : 0,
                },
              }}
            >
              {isSubscribed && (
                <NotificationsNoneIcon
                  sx={{
                    position: "relative",
                    color: "#f1f1f1",
                    marginLeft: "-6px",
                    marginRight: "6px",
                    fontSize: "1.6rem",
                    transformOrigin: "top",
                    animation: shouldAnimate
                      ? `${rotateAnimation} 1.4s ease-in-out`
                      : "none",
                  }}
                />
              )}
              <span
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  position: "relative",
                  color: isSubscribed ? "#f1f1f1" : "#0f0f0f",
                }}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </span>
            </Button>
          )}
          <SignInAlert
            title="Want to subscribe to this channel?"
            desc="Sign in to subscribe this channel."
            isOpen={paperOpen}
            handleClose={handleCloseAlert}
            onConfirm={() => setIsSignIn(true)}
            setActiveAlertId={setActiveAlertId}
            leftVal="225px"
          />
        </Box>
      </>
    );
  }
);
