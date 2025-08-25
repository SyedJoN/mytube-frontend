import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  startTransition,
  useRef,
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

function WatchVideo({ videoId, playlistId }) {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { open } = useContext(DrawerContext);
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Refs
  const watchRef = useRef(null);
  const fsRef = useRef(null);
  const videoRef = useRef(null);

  // Responsive
  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const isDesktop = useMediaQuery(theme.breakpoints.down("xl"));

  // State
  const { data: dataContext } = userContext ?? {};
  const [index, setIndex] = useState(0);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [isMini, setIsMini] = useState(false);
  const [hideMini, setHideMini] = useState(false);
  const [isTheatre, setIsTheatre] = usePlayerSetting("theatreMode", false);
  const [playerMinHeight, setPlayerMinHeight] = useState(360);
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
      isCustomWidth ? "480px" : "360px"
    );
  }, [isCustomWidth]);

  const isWideLayout = isCustomWidth || isTheatre || isFullscreen;

  // Queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: listVideoData } = useQuery({
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

  // shuffle
  useEffect(() => {
    if (!videos || !videoId) return;
    const filtered = videos.filter((video) => video._id !== videoId);
    const shuffled = filtered.length > 0 ? shuffleArray(filtered) : [...videos];
    startTransition(() => {
      setShuffledVideos(shuffled);
    });
  }, [videoId, videos]);

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

  // props
  const videoPlayerProps = {
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
    playerMinHeight,
  };

  const videoDetailsPanelProps = {
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
  };

  const commentSectionProps = {
    videoId,
    data,
    activeAlertId,
    setActiveAlertId,
  };

  const videoSideBarProps = {
    shuffledVideos,
    videoId,
    listVideoData,
  };

  const playlistContainerProps = {
    playlistId,
    playlistData,
    videoId,
  };

  const MemoizedVideoSideBar = useMemo(
    () => <VideoSideBar data={data} {...videoSideBarProps} />,
    [data, videoSideBarProps]
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
  const layoutMode = isFullscreen
    ? "fullscreen"
    : isTheatre
      ? "theatre"
      : "normal";

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
          flexGrow: 1,
          background: "#0f0f0f",
          boxSizing: "content-box",
        }}
      >
        {/* Video Player */}
        <VideoPlayer {...videoPlayerProps} ref={videoRef} />

        {/* Normal Mode */}
        <Box sx={{ display: layoutMode === "normal" ? "block" : "none" }}>
          <Box mt={2}>{MemoizedVideoDetailsPanel}</Box>
          {MemoizedCommentSection}
        </Box>

        {/* Theatre Mode */}
        <Box sx={{ display: layoutMode === "theatre" ? "block" : "none" }}>
          <Grid container sx={{ justifyContent: "center", paddingTop: "45px" }}>
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 8 }}
              sx={{
                marginLeft: margin6x,
                paddingRight: margin6x,
                flexGrow: isDesktop ? "1!important" : "0",
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

        {/* Fullscreen Mode */}
        <Box sx={{ display: layoutMode === "fullscreen" ? "block" : "none" }}>
          <Grid container sx={{ justifyContent: "center", paddingTop: "45px" }}>
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 8 }}
              sx={{
                marginLeft: margin6x,
                paddingRight: margin6x,
                flexGrow: isDesktop ? "1!important" : "0",
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
          flexGrow: isCustomWidth ? "1" : "0",
          width: isCustomWidth
            ? "100%!important"
            : "var(--vtd-watch-flexy-sidebar-width)!important",
          minWidth: "var(--vtd-watch-flexy-sidebar-min-width)",
          py: margin6x,
          px: isCustomWidth ? margin6x : 0,
          pr: margin6x,
        }}
      >
        {MemoizedPlaylistContainer}
        {/* {isCustomWidth && MemoizedVideoDetailsPanel} */}
        {MemoizedVideoSideBar}
        {isCustomWidth && MemoizedCommentSection}
      </Grid>
    </Grid>
  );
}

export default WatchVideo;
