import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { Grid, useMediaQuery, useTheme, Box } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
import { DrawerContext, UserContext } from "../Contexts/RootContexts";
import { useFullscreen } from "../Components/Utils/useFullScreen";

// CSS Variables
const cssVariables = {
  margin6x: "var(--vtd-margin-6x)",
  gridMaxWidth: "var(--vtd-watch-flexy-max-player-width)",
  gridMinWidth: "var(--vtd-watch-flexy-min-player-width)",
  videoLayoutMaxWidth:
    "calc(var(--vtd-watch-flexy-max-player-width-wide-screen) + var(--vtd-watch-flexy-sidebar-width) + var(--vtd-margin-6x) * 3)",
  overrideGridWidth:
    "calc(100% * 7 / var(--Grid-parent-columns) - (var(--Grid-parent-columns) - 7) * (var(--Grid-parent-columnSpacing) / var(--Grid-parent-columns)) - var(--vtd-margin-6x))!important",
  inverseHeaderTop: "calc(-1 * (var(--header-height)))",
};

function WatchVideo({ videoId, playlistId }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Refs
  const watchRef = useRef(null);
  const fsRef = useRef(null);
  const videoRef = useRef(null);

  // Responsive
  const isCustomWidth = useMediaQuery(theme.breakpoints.down("custom"));
  const isDesktop = useMediaQuery(theme.breakpoints.down("xl"));
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));

  // State
  const [index, setIndex] = useState(0);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [isMini, setIsMini] = useState(false);
  const [hideMini, setHideMini] = useState(false);
  const [isTheatre, setIsTheatre] = usePlayerSetting("theatreMode", false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const isFullscreen = useFullscreen();

  // fullscreen body attribute
  useEffect(() => {
    if (isFullscreen) {
      document.body.setAttribute("fullscreen-mode", "");
    } else {
      document.body.removeAttribute("fullscreen-mode");
    }
    return () => document.body.removeAttribute("fullscreen-mode");
  }, [isFullscreen]);

  // fullscreen header hide/show
  useEffect(() => {
    const fullScreenEl = fsRef.current;
    const headerEl = document.querySelector("#header");
    if (!headerEl) return;

    if (!isFullscreen) {
      requestAnimationFrame(() => {
        headerEl.style.transform = "none";
      });
      return;
    }

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
    return () => fullScreenEl.removeEventListener("scroll", onScroll);
  }, [isFullscreen]);

  useEffect(() => {
    const flexyWatchContainer = watchRef.current;
    if (!flexyWatchContainer) return;
    flexyWatchContainer.style.setProperty(
      "--vtd-watch-flexy-min-player-height",
      isCustomWidth
        ? "240px"
        : isLaptop
          ? "360px"
          : isDesktop
            ? "480px"
            : "240px"
    );
  }, [isCustomWidth, isLaptop, isDesktop]);

  // console.log("Child rendering parent (Watch Video)");

  const isWideLayout = isCustomWidth || isTheatre || isFullscreen;

  // Queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: listVideoData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = data?.data?.owner?.username;
  const channelId = data?.data?.owner?._id;
  const channelName = data?.data?.owner?.fullName;
  const owner = data?.data?.owner?.username;

  const { data: userData } = useQuery({
    queryKey: ["channelProfile", user],
    queryFn: () => getUserChannelProfile(user),
    refetchOnWindowFocus: false,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: playlistData } = useQuery({
    queryKey: ["playlists", playlistId],
    queryFn: () => fetchPlaylistById(playlistId),
    refetchOnWindowFocus: false,
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000,
  });

  const playlistVideos = playlistData?.data?.videos || [];
  const videos = listVideoData?.data?.docs || [];

  const shuffledVideos = useMemo(() => {
    if (!videos || !videoId) return [];

    const filtered = videos.filter((video) => video._id !== videoId);
    return filtered.length > 0 ? shuffleArray(filtered) : [...videos];
  }, [videos, videoId]);

  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData, subscriberCount]);

  useEffect(() => {
    const playIndex = playlistVideos?.findIndex(
      (video) => video._id === videoId
    );
    if (playIndex !== -1) {
      setIndex(playIndex);
    }
  }, [playlistVideos, videoId]);

  useEffect(() => {
    if (playlistVideos[index + 1]) {
      queryClient.prefetchQuery({
        queryKey: ["video", playlistVideos[index + 1]._id],
        queryFn: () => fetchVideoById(playlistVideos[index + 1]._id),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [playlistVideos, index, queryClient]);

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

  const videoPlayerProps = useMemo(
    () => ({
      index,
      data,
      isLoading,
      isError,
      error,
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
    }),
    [
      index,
      data,
      isLoading,
      isError,
      error,
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
    ]
  );

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

  const playlistContainerProps = useMemo(
    () => ({
      playlistId,
      playlistData,
      videoId,
    }),
    [playlistId, playlistData, videoId]
  );

  const MemoizedVideoSideBar = useMemo(
    () => (
      <VideoSideBar
        shuffledVideos={shuffledVideos}
        isLoadingList={isLoadingList}
        isErrorList={isErrorList}
        errorList={errorList}
      />
    ),
    [shuffledVideos, isLoadingList, isErrorList, errorList]
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

  // Single mode selector
  const layoutMode = useMemo(() => {
    return isFullscreen ? "fullscreen" : isTheatre ? "theatre" : "normal";
  }, [isFullscreen, isTheatre]);

  const {
    gridMaxWidth,
    gridMinWidth,
    inverseHeaderTop,
    margin6x,
    videoLayoutMaxWidth,
    overrideGridWidth,
  } = cssVariables;

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
        flex: 1,
        flexBasis: "0.00001px",
      }}
    >
      {/* Video Player Container */}
      <Grid
        ref={fsRef}
        className={`${isFullscreen ? "fullscreen-grid" : ""} `}
        size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 8 }}
        sx={{
          position: "relative",
          top: isFullscreen ? inverseHeaderTop : "0",
          maxWidth: isWideLayout ? "100%" : gridMaxWidth,
          minWidth: isWideLayout ? "100%" : gridMinWidth,
          p: isWideLayout ? 0 : margin6x,
          overflowY: isFullscreen ? "auto" : "visible",
          overflowX: "visible",
          width: isWideLayout ? "100%!important" : "",
          flexGrow: "1!important",
          background: "#0f0f0f",
          boxSizing: "content-box",
        }}
      >
        {/* Video Player */}
        <VideoPlayer {...videoPlayerProps} ref={videoRef} />

        {/* Normal Mode */}
        <Box sx={{ display: layoutMode === "normal" ? "block" : "none" }}>
          <Box
            sx={{
              margin: isCustomWidth ? margin6x : 0,
              paddingTop: !isCustomWidth ? margin6x : 0,
            }}
          >
            {MemoizedVideoDetailsPanel}
          </Box>
          <Box sx={{ display: !isCustomWidth ? "block" : "none" }}>
            {MemoizedCommentSection}
          </Box>
        </Box>

        {/* Theatre Mode */}
        <Box sx={{ display: layoutMode === "theatre" ? "block" : "none" }}>
          <Grid
            container
            sx={{
              justifyContent: "center",
              flexWrap: isCustomWidth ? "wrap" : "nowrap!important",
              paddingTop: isCustomWidth ? margin6x : "45px",
              maxWidth: videoLayoutMaxWidth,
            }}
          >
            <Grid
              size={{ xs: 12, sm: 12, lg: 7, xl: 8 }}
              sx={{
                width: overrideGridWidth,
                maxWidth: gridMaxWidth,
                minWidth: gridMinWidth,
                marginLeft: margin6x,
                paddingRight: margin6x,
                pb: margin6x,
                flex: "1!important",
                flexBasis: "0.00001px",
              }}
            >
              {MemoizedVideoDetailsPanel}
              <Box sx={{ display: !isCustomWidth ? "block" : "none" }}>
                {MemoizedCommentSection}
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
              sx={{
                width: isCustomWidth
                  ? "100%!important"
                  : "var(--vtd-watch-flexy-sidebar-width)!important",
                minWidth: "var(--vtd-watch-flexy-sidebar-min-width)",
                pl: isCustomWidth ? margin6x : 0,
                paddingRight: margin6x,
              }}
            >
              {MemoizedPlaylistContainer}
              {MemoizedVideoSideBar}
              {isCustomWidth && MemoizedCommentSection}
            </Grid>
          </Grid>
        </Box>

        {/* Fullscreen Mode */}
        <Box sx={{ display: layoutMode === "fullscreen" ? "block" : "none" }}>
          <Grid container sx={{ justifyContent: "center", paddingTop: "45px" }}>
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 8 }}
              sx={{
                marginLeft: margin6x,
                paddingRight: margin6x,
                flex: isDesktop ? "1!important" : "0",
                flexBasis: "0.00001px",
              }}
            >
              {MemoizedVideoDetailsPanel}
              {MemoizedCommentSection}
            </Grid>
            <Grid
              size={{ xs: 12, sm: 12, md: 5, lg: 4, xl: 4 }}
              sx={{
                width: isCustomWidth
                  ? "100%!important"
                  : "var(--vtd-watch-flexy-sidebar-width)!important",
                minWidth: !isCustomWidth
                  ? "426px"
                  : "var(--vtd-watch-flexy-sidebar-min-width)",
                pl: isCustomWidth ? margin6x : 0,
                paddingRight: margin6x,
              }}
            >
              {MemoizedPlaylistContainer}
              {MemoizedVideoSideBar}
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Main Sidebar for Normal Mode */}
      <Grid
        size={{ xs: 12, sm: 12, md: 4 }}
        sx={{
          display: layoutMode === "normal" ? "block" : "none",
          flex: 1,
          flexBasis: "0.00001px",
          width: isCustomWidth
            ? "100%!important"
            : "var(--vtd-watch-flexy-sidebar-width)!important",
          minWidth: "var(--vtd-watch-flexy-sidebar-min-width)",
          pl: isCustomWidth ? margin6x : 0,
          pr: margin6x,
          marginTop: !isCustomWidth ? margin6x : 0,
        }}
      >
        {MemoizedPlaylistContainer}
        {MemoizedVideoSideBar}
        {isCustomWidth && MemoizedCommentSection}
      </Grid>
    </Grid>
  );
}

export default memo(WatchVideo);
