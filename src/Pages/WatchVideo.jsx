import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  startTransition,
  useRef,
  forwardRef,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { Grid, useMediaQuery, useTheme, Box } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { filter } from "lodash";

// Components
import VideoPlayer from "../Components/Video/VideoPlayer";
import VideoDetailsPanel from "../Components/Video/VideoDetailsPanel";
import CommentSection from "../Components/Comments/CommentSection";
import PlaylistContainer from "../Components/Video/PlaylistContainer";
import VideoSideBar from "../Components/Video/VideoSideBar";

// APIs and Utils
import { fetchVideoById, fetchVideos } from "../apis/videoFn";
import { fetchPlaylistById } from "../apis/playlistFn";
import { getUserChannelProfile } from "../apis/userFn";
import { shuffleArray } from "../helper/shuffle";
import { usePlayerSetting } from "../helper/usePlayerSettings";
import {
  DrawerContext,
  UserContext,
  UserInteractionContext,
} from "../Contexts/RootContexts";
import { useFullscreen } from "../Components/Utils/useFullScreen";

function WatchVideo({ videoId, playlistId }) {
  // Hooks and Context
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { open } = useContext(DrawerContext);
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Refs
  const watchRef = useRef(null);
  const fsRef = useRef(null);
  const videoRef = useRef(null);

  // Responsive breakpoints
  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const [index, setIndex] = useState(0);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isMini, setIsMini] = useState(false);
  const [hideMini, setHideMini] = useState(false);
  const [isTheatre, setIsTheatre] = usePlayerSetting("theatreMode", false);
  const [playerMinHeight, setPlayerMinHeight] = useState(360);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const isFullscreen = useFullscreen();

  useEffect(() => {
    const fullScreenEl = watchRef.current;
    if (!fullScreenEl) return;
    if (isFullscreen) {
      document.body.setAttribute("fullscreen-mode", "");
    } else {
      document.body.removeAttribute("fullscreen-mode");
    }
    return () => document.body.removeAttribute("fullscreen-mode");
  }, [isFullscreen]);

  useEffect(() => {
    const fullScreenEl = fsRef.current;
    const headerEl = document.querySelector("#header");

    if (!headerEl) return;

    if (!isFullscreen) {
      // 🔹 When fullscreen is OFF → reset to normal
      requestAnimationFrame(() => {
        headerEl.style.transform = "none";
      });
      return;
    }

    // 🔹 When fullscreen is ON → start hidden
    headerEl.style.transform = "translateY(calc(-100% - 5px))";

    if (!fullScreenEl) return;

    const onScroll = () => {
      const headerHeight = headerEl.offsetHeight || 56;
      const y = Math.min(fullScreenEl.scrollTop, headerHeight);

      const percent = -100 + (y / headerHeight) * 100;
      const px = -5 + 5 * (y / headerHeight);

      requestAnimationFrame(() => {
        headerEl.style.transform = `translateY(calc(${percent}% + ${px}px))`;
      });
    };

    fullScreenEl.addEventListener("scroll", onScroll);

    return () => {
      fullScreenEl.removeEventListener("scroll", onScroll);
      // no need to reset here — already handled by !isFullscreen branch
    };
  }, [isFullscreen]);

  useEffect(() => {
    const flexyWatchContainer = watchRef.current;
    if (!flexyWatchContainer) return;
    flexyWatchContainer.style.setProperty(
      "--vtd-watch-flexy-min-player-height",
      isCustomWidth ? "480px" : "360px"
    );
  }, [isCustomWidth]);

  // Memoized layout calculations to prevent re-renders
  const isWideLayout = isCustomWidth || isTheatre || isFullscreen;

  const showMainSidebar =
    (isTheatre && isCustomWidth && !isFullscreen) || !isTheatre;

  // Stable keys to prevent component re-mounting
  const sidebarKey = useMemo(
    () =>
      `sidebar-${videoId}-${isTheatre ? "theatre" : "normal"}-${isFullscreen ? "fs" : "windowed"}`,
    [videoId, isTheatre, isFullscreen]
  );

  // Data fetching - Video
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
  });

  // Storing aspect-ratio

  useEffect(() => {
    const video = videoRef.current;
    const flexyWatchContainer = watchRef.current;
    if (!video || flexyWatchContainer) return;
    const updateAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(video.videoWidth / video.videoHeight);
        flexyWatchContainer.style.setProperty(
          "--flexy-vt-player-width",
          video.videoWidth
        );
        flexyWatchContainer.style.setProperty(
          "--flexy-vt-player-height",
          video.videoHeight
        );
      }
    };

    // Listen for when metadata is loaded
    video.addEventListener("loadedmetadata", updateAspectRatio);

    // In case metadata is already loaded (cached video)
    updateAspectRatio();

    return () => {
      video.removeEventListener("loadedmetadata", updateAspectRatio);
    };
  }, [isTheatre, data?.data?._id, isFullscreen, isMini]);

  // Data fetching - Videos list
  const {
    data: listVideoData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    refetchOnWindowFocus: false,
  });

  // Extract video owner data
  const user = data?.data?.owner?.username;
  const channelId = data?.data?.owner?._id;
  const channelName = data?.data?.owner?.fullName;
  const owner = data?.data?.owner?.username;

  // Data fetching - User profile
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["channelProfile", user],
    queryFn: () => getUserChannelProfile(user),
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  // Data fetching - Playlist
  const {
    data: playlistData,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
  } = useQuery({
    queryKey: ["playlists", playlistId],
    queryFn: () => fetchPlaylistById(playlistId),
    refetchOnWindowFocus: false,
    enabled: !!playlistId,
  });

  // Extracted data
  const playlistVideos = playlistData?.data?.videos || [];
  const videos = listVideoData?.data?.docs || [];

  // Effect: Handle fullscreen changes

  // Effect: Shuffle videos for sidebar
  useEffect(() => {
    if (!videos || !videoId) return;

    const filtered = videos.filter((video) => video._id !== videoId);
    const shuffled = filtered.length > 0 ? shuffleArray(filtered) : [...videos];

    startTransition(() => {
      setShuffledVideos(shuffled);
    });
  }, [videoId, videos]);

  // Effect: Update subscriber count
  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData, subscriberCount]);

  // Effect: Set playlist index
  useEffect(() => {
    const playIndex = playlistVideos?.findIndex(
      (video) => video._id === videoId
    );
    if (playIndex !== -1) {
      setIndex(playIndex);
    }
  }, [playlistVideos, videoId]);

  // Effect: Prefetch next video
  useEffect(() => {
    if (playlistVideos[index + 1]) {
      queryClient.prefetchQuery({
        queryKey: ["video", playlistVideos[index + 1]._id],
        queryFn: () => fetchVideoById(playlistVideos[index + 1]._id),
      });
    }
  }, [playlistVideos, index, queryClient]);

  // Handler: Next video navigation
  const handleNextVideo = useCallback(() => {
    if (!playlistId) {
      navigate({
        to: "/watch",
        search: { v: shuffledVideos[0]?._id },
      });
    } else if (index < playlistVideos.length - 1) {
      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index + 1]._id,
          list: playlistId,
          index: index + 2,
        },
      });
    }
  }, [playlistId, shuffledVideos, playlistVideos, index, navigate]);

  // Memoized props objects to prevent unnecessary re-renders
  const videoPlayerProps = {
    index,
    data,
    isLoading,
    isError,
    error,
    isSubscribedTo: userData?.data?.isSubscribedTo,
    videoId,
    playlistId,
    playlistVideos,
    shuffledVideos,
    handleNextVideo,
    isTheatre,
    setIsTheatre,
    isMini,
    setIsMini,
    hideMini,
    setHideMini,
    watchRef,
    aspectRatio,
    playerMinHeight,
  };

  const videoDetailsPanelProps = useMemo(
    () => ({
      videoId,
      data,
      userData,
      user,
      channelId,
      channelName,
      subscriberCount,
      owner,
      activeAlertId,
      setActiveAlertId,
    }),
    [
      videoId,
      data,
      userData,
      user,
      channelId,
      channelName,
      subscriberCount,
      owner,
      activeAlertId,
      setActiveAlertId,
    ]
  );

  const commentSectionProps = useMemo(
    () => ({
      videoId,
      data,
      activeAlertId,
      setActiveAlertId,
    }),
    [videoId, data, activeAlertId, setActiveAlertId]
  );

  const videoSideBarProps = useMemo(
    () => ({
      shuffledVideos,
      videoId,
      listVideoData,
      isLoadingList,
      isErrorList,
      errorList,
      scrollContainerRef: isFullscreen ? isFullscreen : null,
    }),
    [
      shuffledVideos,
      videoId,
      listVideoData,
      isLoadingList,
      isErrorList,
      errorList,
      watchRef,
      isFullscreen,
    ]
  );

  const playlistContainerProps = useMemo(
    () => ({
      playlistId,
      playlistData,
      videoId,
    }),
    [playlistId, playlistData, videoId]
  );

  // Memoized components to prevent re-mounting
  const MemoizedVideoSideBar = useMemo(
    () => <VideoSideBar key={sidebarKey} data={data} {...videoSideBarProps} />,
    [sidebarKey, videoSideBarProps]
  );

  const MemoizedPlaylistContainer = useMemo(
    () =>
      playlistId ? <PlaylistContainer {...playlistContainerProps} /> : null,
    [playlistId, playlistContainerProps]
  );

  const MemoizedVideoDetailsPanel = useMemo(
    () => <VideoDetailsPanel {...videoDetailsPanelProps} />,
    [videoDetailsPanelProps]
  );

  const MemoizedCommentSection = useMemo(
    () => <CommentSection {...commentSectionProps} />,
    [commentSectionProps]
  );

  // Memoized layout component to prevent recreation
  const TwoColumnLayout = useCallback(
    ({
      leftContent,
      rightContent,
      leftSize = 7.5,
      rightSize = 4.5,
      paddingY = margin6x,
      leftPaddingY = null,
    }) => (
      <Grid
        container
        direction="row"
        spacing={0}
        sx={{
          flexWrap: "noWrap",
          width: "100%",
          justifyContent: !isCustomWidth ? "center" : "flex-start",
          alignItems: isCustomWidth ? "center" : "flex-start",
          flexGrow: 1,
        }}
      >
        <Grid
          size={{ xs: leftSize, sm: leftSize, md: leftSize }}
          sx={{
            flexGrow: isCustomWidth ? "1" : "0",
            maxWidth: "100%",
            minWidth: isCustomWidth ? "100%" : "300px!important",
            py: leftPaddingY ?? paddingY,
            px: isCustomWidth ? margin6x : 0,
            pr: margin6x,
          }}
        >
          {leftContent}
        </Grid>
        <Grid
          size={{ xs: rightSize, sm: rightSize, md: rightSize }}
          sx={{
            flexGrow: isCustomWidth ? "1" : "0",
            maxWidth: "402px",
            minWidth: isCustomWidth ? "100%" : "300px!important",
            py: margin6x,
            px: isCustomWidth ? margin6x : 0,
            pr: margin6x,
          }}
        >
          {rightContent}
        </Grid>
      </Grid>
    ),
    [isCustomWidth]
  );

  // Conditional rendering helpers to prevent unnecessary DOM updates
  const shouldShowNormalDesktopDetails = useMemo(
    () => !isCustomWidth && !isTheatre && !isFullscreen,
    [isCustomWidth, isTheatre, isFullscreen]
  );

  const shouldShowTheatreMode = useMemo(
    () => isTheatre && !isCustomWidth,
    [isTheatre, isCustomWidth]
  );

  // Style constants
  const gridMaxWidth = "var(--vtd-watch-flexy-max-player-width)";

  const gridMinWidth = "var(--vtd-watch-flexy-min-player-width)";

  const inverseHeaderTop = "calc(-1 * (var(--header-height)))";

  const margin6x = "var(--vtd-margin-6x)";
  return (
    <Grid
      ref={watchRef}
      className="flexy-video-grid-container"
      container
      direction={isWideLayout ? "column" : "row"}
      spacing={0}
      sx={{
        flexWrap: "noWrap",
        justifyContent: !isCustomWidth ? "center" : "flex-start",
        alignItems: isCustomWidth ? "center" : "flex-start",
        flexGrow: 1,
      }}
    >
      {/* Video Player Container */}
      <Grid
        ref={fsRef}
        className={`${isFullscreen ? "fullscreen-grid" : ""} `}
        size={{ xs: 12, sm: 11.5, md: 8 }}
        sx={{
          position: "relative",
          top: isFullscreen ? inverseHeaderTop : "0",
          maxWidth: isWideLayout ? "100%" : gridMaxWidth,
          minWidth: isWideLayout ? "100%" : gridMinWidth,
          p: isWideLayout ? 0 : margin6x,
          overflowY: isFullscreen ? "auto" : "visible",
          overflowX: "visible",
          width: isWideLayout ? "100%!important" : "",
          flex: 1,
          background: "#0f0f0f",
        boxSizing: "content-box",

        }}
      >
        {/* Video Player */}
        <VideoPlayer {...videoPlayerProps} ref={videoRef} />

        {/* Desktop Normal Mode - Video Details */}
        {shouldShowNormalDesktopDetails && (
          <Box sx={{ mt: 2 }}>
            <Box marginTop={margin6x}>{MemoizedVideoDetailsPanel}</Box>

            {/* Theatre Mode Content - Nested inside normal mode box */}
            {shouldShowTheatreMode && (
              <Box sx={{ width: "100%" }}>
                <TwoColumnLayout
                  leftContent={
                    <>
                      {MemoizedVideoDetailsPanel}
                      {MemoizedCommentSection}
                    </>
                  }
                  rightContent={
                    <>
                      {MemoizedPlaylistContainer}
                      {MemoizedVideoSideBar}
                    </>
                  }
                  paddingY={0}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Fullscreen Mode Content */}
        {isFullscreen && (
          <Box sx={{ width: "100%" }}>
            <TwoColumnLayout
              leftContent={
                <>
                  {MemoizedVideoDetailsPanel}
                  {MemoizedCommentSection}
                </>
              }
              rightContent={
                <>
                  {MemoizedPlaylistContainer}
                  {MemoizedVideoSideBar}
                </>
              }
              leftPaddingY={4}
            />
          </Box>
        )}

        {/* Desktop Normal Mode - Comments */}
        {shouldShowNormalDesktopDetails && <Box>{MemoizedCommentSection}</Box>}
      </Grid>

      {/* Main Sidebar - Normal Desktop Mode */}
      {showMainSidebar && (
        <Grid
          size={{ xs: 12, sm: 12, md: 4 }}
          sx={{
            flexGrow: isCustomWidth ? "1" : "0",
            width: isCustomWidth ? "100%!important" : "var(--vtd-watch-flexy-sidebar-width)!important",
            flex: 1,
            minWidth: "var(--vtd-watch-flexy-sidebar-min-width)",
            py: margin6x,
            px: isCustomWidth ? margin6x : 0,
            pr: margin6x,
          }}
        >
          {MemoizedPlaylistContainer}

          {isCustomWidth && MemoizedVideoDetailsPanel}

          {MemoizedVideoSideBar}

          {isCustomWidth && MemoizedCommentSection}
        </Grid>
      )}

      {/* Theatre Mode Content - Bottom Section */}
      {shouldShowTheatreMode && (
        <Box sx={{ width: "100%" }}>
          <TwoColumnLayout
            leftContent={
              <>
                {MemoizedVideoDetailsPanel}
                {MemoizedCommentSection}
              </>
            }
            rightContent={
              <>
                {MemoizedPlaylistContainer}
                {MemoizedVideoSideBar}
              </>
            }
            leftSize={6}
            rightSize={6}
            leftPaddingY={4}
          />
        </Box>
      )}
    </Grid>
  );
}

export default WatchVideo;
