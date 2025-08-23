import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSubscription } from "../../apis/subscriptionFn";
import Button from "@mui/material/Button";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { keyframes, positions } from "@mui/system";
import { getUserChannelProfile } from "../../apis/userFn";
import { useTheme } from "@mui/material/styles";
import AlertDialog from "../Dialogs/Dialog";
import SimpleSnackbar from "../Utils/Snackbar";
import Box from "@mui/system/Box";
import { useSnackbar } from "../../Contexts/SnackbarContext";
import Signin from "../Auth/Signin";
import SignInAlert from "../Dialogs/SignInAlert";
import { useMediaQuery } from "@mui/material";

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
    channelProfile,
    isAuthenticated,
    channelName,
    channelId,
    userData,
    initialSubscribed,
    initialSubscribers,
    user,
    activeAlertId,
    setActiveAlertId,
    marginLeftVal = "16px",
  }) => {
    const theme = useTheme();
    const currentAlertId = `alert-${channelId}`;
    const paperOpen = activeAlertId === currentAlertId;
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const { showMessage } = useSnackbar();
    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSignIn, setIsSignIn] = useState(false);
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

    const launchFireworks = () => {
      if (!buttonRef.current) return;

      const { left, top, width, height } =
        buttonRef.current.getBoundingClientRect();

      const steps = 10; // Number of steps from left to right
      let currentStep = 0;

      const animateFireworks = () => {
        if (currentStep > steps || !buttonRef.current) return;

        const originX =
          (left + (width / steps) * currentStep) / window.innerWidth;
        const originY = (top + height + 5) / window.innerHeight; // Just below the button

        confetti({
          particleCount: 1,
          startVelocity: 2,
          spread: 260,
          ticks: 10,
          gravity: 0,
          scalar: 0.8,
          shapes: ["star"],
          colors: ["#C71585"], // Yellow Star
          origin: { x: originX, y: originY },
        });

        confetti({
          particleCount: 1,
          startVelocity: 4,
          spread: 260,
          ticks: 10,
          gravity: 0,
          scalar: 1,
          shapes: ["square"],
          colors: ["#FFD700"],
          origin: { x: originX, y: originY },
        });

        currentStep++;
        setTimeout(animateFireworks, 10);
      };

      animateFireworks();
    };

    const handleTransitionEnd = () => {
      if (isSubscribed) {
        setShowGradient(false);
      }
    };

    const handleSubscribeBtn = (e) => {
      e.stopPropagation();

      if (isLoading) return;

      if (isAuthenticated && isSubscribed) {
        setDialogOpen(true);
      } else if (isAuthenticated && !isSubscribed) {
        mutate();
      } else {
        setActiveAlertId(paperOpen ? null : currentAlertId);
      }
    };

    useEffect(() => {
      if (!userData?.data) return;

      if (!hasLoaded) {
        setHasLoaded(true);
      }
    }, [userData]);

    const { mutate, isLoading } = useMutation({
      mutationFn: () => toggleSubscription(channelId),

      onMutate: async () => {
        await queryClient.cancelQueries(["channelProfile", user]);
        const prevData = queryClient.getQueryData(["channelProfile", user]);
        const isSubscribing = !prevData?.data?.isSubscribedTo;

        queryClient.setQueryData(["channelProfile", user], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isSubscribedTo: isSubscribing,
              subscribersCount: isSubscribing
                ? old.data.subscribersCount + 1
                : old.data.subscribersCount - 1,
            },
          };
        });

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

        return { prevData };
      },

      onError: (_, __, context) => {
        setIsSubscribed(context.prevSubscribed);
        setSubscriberCount(context.prevCount);
      },

      onSettled: () => {
        queryClient.invalidateQueries(["channelProfile", user]);
      },

      onSuccess: (_, __, context) => {
        showMessage(
          !context.prevData.data.isSubscribedTo ? "Subscription added" : "Subscription removed"
        );
      },
    });

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

        <Box
          sx={{
            display: "flex",
            justifyContent: isTablet && channelProfile ? "center" : "start",
            mt: isTablet && channelProfile ? 1 : 0,
          }}
        >
          {hasLoaded && (
            <Button
              ref={buttonRef}
              disabled={isLoading}
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
                marginLeft: marginLeftVal,
                padding: "0 16px",
                width:
                  isSubscribed && !isTablet && channelProfile
                    ? "140px"
                    : !isSubscribed && !isTablet
                      ? "100px"
                      : channelProfile
                        ? "590px"
                        : "100%",
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
                  opacity: isSubscribed && showGradient && !isTablet ? 1 : 0,
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
                  color: isSubscribed ? "#f1f1f1" : theme.palette.primary.main,
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
