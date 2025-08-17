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
import { UserContext, UserInteractionContext } from "../Contexts/RootContexts";
import { useFullscreen } from "../Components/Utils/useFullScreen";

function WatchVideo({ videoId, playlistId }) {
  // Hooks and Context
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const theme = useTheme();
  const queryClient = useQueryClient();
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
  const [isTheatre, setIsTheatre] = usePlayerSetting("theatreMode", false);
  const isFullscreen = useFullscreen();
  const [playerMinHeight, setPlayerMinHeight] = useState(
    isCustomWidth ? 480 : 360
  );
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Memoized layout calculations to prevent re-renders
  const isWideLayout = useMemo(
    () => isCustomWidth || isTheatre || isFullscreen,
    [isCustomWidth, isTheatre, isFullscreen]
  );

  const showMainSidebar = useMemo(
    () => !(isTheatre && !isCustomWidth),
    [isTheatre, isCustomWidth]
  );

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
  if (!video) return;

  const updateAspectRatio = () => {
    if (video.videoWidth && video.videoHeight) {
      setAspectRatio(video.videoWidth / video.videoHeight);
    }
  };

  // Listen for when metadata is loaded
  video.addEventListener('loadedmetadata', updateAspectRatio);

  // In case metadata is already loaded (cached video)
  updateAspectRatio();

  return () => {
    video.removeEventListener('loadedmetadata', updateAspectRatio);
  };
}, [isTheatre, data?.data?._id, isFullscreen]);


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
      fsRef,
      aspectRatio,
      playerMinHeight,
    }

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
      fsRef,
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
      paddingY = 3,
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
            px: isCustomWidth ? 3 : 0,
            pr: 3,
          }}
        >
          {leftContent}
        </Grid>
        <Grid
          size={{ xs: rightSize, sm: rightSize, md: rightSize }}
          sx={{
            flexGrow: isCustomWidth ? "1" : "0",
            maxWidth: "426px",
            minWidth: isCustomWidth ? "100%" : "300px!important",
            py: 3,
            px: isCustomWidth ? 3 : 0,
            pr: 3,
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

  return (
    <Grid
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
        className={isFullscreen ? "fullscreen-grid" : ""}
        ref={fsRef}
        size={{ xs: 12, sm: 11.5, md: 7 }}
        sx={{
          maxWidth: isWideLayout
            ? "100%"
            : `calc((100vh - 56px - 24px - 136px) * (${aspectRatio}))`,
          minWidth: isWideLayout
            ? "100%"
            : `calc(${playerMinHeight}px * (${aspectRatio}))`,
          p: isWideLayout ? 0 : 3,
          overflowY: isFullscreen ? "scroll" : "hidden",
          overflowX: isFullscreen ? "hidden" : "",
          width: isWideLayout ? "100%!important" : "",
          flex: 1,
          background: "#0f0f0f",
        }}
      >
        {/* Video Player */}
        <VideoPlayer {...videoPlayerProps} ref={videoRef} />

        {/* Desktop Normal Mode - Video Details */}
        {shouldShowNormalDesktopDetails && (
          <Box sx={{ mt: 2 }}>
            <Box marginTop={3}>{MemoizedVideoDetailsPanel}</Box>

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
            maxWidth: "426px!important",
            flex: 1,
            minWidth: isCustomWidth ? "100%" : "300px!important",
            py: 3,
            px: isCustomWidth ? 3 : 0,
            pr: 3,
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
