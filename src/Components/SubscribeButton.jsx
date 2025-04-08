import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSubscription } from "../apis/subscriptionFn";
import Button from "@mui/material/Button";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { keyframes } from "@mui/system";
import { getUserChannelProfile } from "../apis/userFn";

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
  ({ channelId, initialSubscribed, initialSubscribers, user }) => {
    
    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [subscriberCount, setSubscriberCount] = useState(initialSubscribers);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [showGradient, setShowGradient] = useState(false);
    const buttonRef = useRef(null);
    const queryClient = useQueryClient();


    const buttonStyles = {
        base: {
          position: 'relative',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50px',
          height: '36px',
          fontSize: '0.8rem',
          padding: 0,
          textTransform: 'capitalize',
          fontWeight: '600',
          transition: 'width 0.5s ease, background 0.3s ease',
          overflow: 'hidden',
          marginLeft: '8px',
          width: isSubscribed ? '130px' : '100px'
        },
        before: {
            content: '""',
            position: 'absolute',
            height: '100%',
            zIndex: 0,
            width: '100%',
            background: 'linear-gradient(135deg, rgba(252, 38, 173, 0.99), rgba(255, 0, 187, 0.71))',
            transition: 'opacity 0.1s ease-out', // Quick fade out
            opacity: showGradient ? 1 : 0
        }
      };

      const handleTransitionEnd = () => {
        if (isSubscribed) {
          setShouldAnimate(true);
          setShowGradient(false);
        }
      };

 
      
      useEffect(() => {
        if (!isSubscribed) {
          setShouldAnimate(false);
        }

        if (!isSubscribed) {
            setShowGradient(false);
          }
      }, [isSubscribed]);

    const {
      data: userData,
      isLoading: isUserLoading,
      isError: isUserError,
      isFetching: isUserFetching,
      error: userError,
    } = useQuery({
      queryKey: ["channelProfile", user],
      queryFn: () => getUserChannelProfile(user),
      enabled: Boolean(user),
    });

    const { mutate, isLoading } = useMutation({
      mutationFn: () => toggleSubscription(channelId),
      onMutate: () => {
        setShowGradient(true);
        setIsSubscribed((prev) => !prev);
        setSubscriberCount((prev) => prev + (isSubscribed ? -1 : 1));
      },
      onSuccess: (data) => {
        console.log(data);
        queryClient.invalidateQueries(["channelProfile", user]);
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

    return isSubscribed ? (
      <Button
        ref={buttonRef}
        onClick={() => mutate()}
        sx={{
            ...buttonStyles.base,
            '&::before': buttonStyles.before
          }}
          onTransitionEnd={handleTransitionEnd}
      >
        <NotificationsNoneIcon
          sx={{
            position: "relative",
            color: "#f1f1f1",
            marginLeft: "-6px",
            marginRight: "6px",
            fontSize: "1.6rem",
            transformOrigin: "top",
            animation: shouldAnimate ? `${rotateAnimation} 1.4s ease-in-out` : 'none',
          }}
        />
        <span
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            color: "#f1f1f1",
            position: "relative",
          }}
        >
          Subscribed
        </span>
      </Button>
    ) : (
      <Button
        onClick={() => mutate()}
        sx={{
          background: "#f1f1f1",

          "&:hover": {
            background: "#d9d9d9",
          },
          borderRadius: "50px",
          width: "100px",
          height: "36px",
          fontSize: "0.8rem",
          textTransform: "capitalize",
          overflow: "hidden",
          fontWeight: "600",
          marginLeft: 2,
          padding: "0 16px",
        }}
      >
        <span style={{ color: "#0f0f0f" }}>Subscribe</span>
      </Button>
    );
  }
);
