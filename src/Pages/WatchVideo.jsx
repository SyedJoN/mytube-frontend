import {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  startTransition,
  useRef,
} from "react";
import VideoPlayer from "../Components/Video/VideoPlayer";
import { useNavigate } from "@tanstack/react-router";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import VideoDetailsPanel from "../Components/Video/VideoDetailsPanel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVideoById, fetchVideos } from "../apis/videoFn";
import { Box } from "@mui/material";
import CommentSection from "../Components/Comments/CommentSection";
import PlaylistContainer from "../Components/Video/PlaylistContainer";
import VideoSideBar from "../Components/Video/VideoSideBar";
import { shuffleArray } from "../helper/shuffle";
import { fetchPlaylistById } from "../apis/playlistFn";
import { getUserChannelProfile } from "../apis/userFn";
import { filter } from "lodash";
import { usePlayerSetting } from "../helper/usePlayerSettings";
import { UserContext, UserInteractionContext } from "../Contexts/RootContexts";

function WatchVideo({ videoId, playlistId }) {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const theme = useTheme();
  const { data: dataContext } = userContext ?? {};
  const [index, setIndex] = useState(0);
  const isAuthenticated = dataContext || null;
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isTheatre, setIsTheatre] = usePlayerSetting("theatreMode", false);
  const queryClient = useQueryClient();
  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const fsRef = useRef(null);

  const [playerMinHeight, setPlayerMinHeight] = useState(
    isCustomWidth ? 480 : 360
  );
  // video fetching
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
  });

  const user = data?.data?.owner?.username;

  const channelId = data?.data?.owner?._id;
  const channelName = data?.data?.owner?.fullName;

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

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const videos = listVideoData?.data?.docs || [];
  useEffect(() => {
    if (!videos || !videoId) return;

    const filtered = videos.filter((video) => video._id !== videoId);

    const shuffled = filtered.length > 0 ? shuffleArray(filtered) : [...videos];
    startTransition(() => {
      setShuffledVideos(shuffled);
    });
  }, [videoId, videos]);

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
  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data?.subscribersCount ?? 0
  );
  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData]);
  const owner = data?.data?.owner?.username;

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

  const playlistVideos = playlistData?.data?.videos || [];
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
      });
    }
  }, [playlistVideos, index]);

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
  }, [playlistId, shuffledVideos, playlistVideos, index]);

  return (
    <Grid
      container
      direction={isCustomWidth || isTheatre || isFullScreen ? "column" : "row"}
      spacing={0}
      sx={{
        flexWrap: "noWrap",
        justifyContent: !isCustomWidth ? "center" : "flex-start",
        alignItems: isCustomWidth ? "center" : "flex-start",
        flexGrow: 1,
      }}
    >
      <Grid
        ref={fsRef}
        size={{ xs: 12, sm: 11.5, md: 7 }}
        sx={{
          maxWidth:
            isTheatre || isCustomWidth || isMobile || isFullScreen
              ? "100%"
              : "calc((100vh - 56px - 24px - 136px) * (1 / 0.75))",
          minWidth:
            isTheatre || isCustomWidth || isMobile || isFullScreen
              ? "100%"
              : `calc(${playerMinHeight}px * (1/0.75))`,
          p: isTheatre || isCustomWidth || isMobile || isFullScreen ? 0 : 3,
          overflowY: isFullScreen ? "scroll" : "hidden",
          overflowX: "hidden",
          width:
            isCustomWidth || isTheatre || isMobile || isFullScreen
              ? "100%!important"
              : "",
          flex: 1,
          background: "#0f0f0f"
        }}
      >
        <VideoPlayer
          index={index}
          isSubscribedTo={userData?.data?.isSubscribedTo}
          videoId={videoId}
          playlistId={playlistId}
          playlistVideos={playlistVideos}
          shuffledVideos={shuffledVideos}
          handleNextVideo={handleNextVideo}
          isTheatre={isTheatre}
          setIsTheatre={setIsTheatre}
          fsRef={fsRef}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          playerMinHeight={playerMinHeight}
        />

        <Box
          sx={{
            display:
              !isCustomWidth && !isTheatre && !isFullScreen ? "block" : "none",
            mt: 2,
          }}
        >
          <Box marginTop={2}>
            <VideoDetailsPanel
              videoId={videoId}
              data={data}
              userData={userData}
              user={user}
              channelId={channelId}
              channelName={channelName}
              subscriberCount={subscriberCount}
              owner={owner}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Box>
          <Box
        sx={{
          width: "100%",
          display: (isTheatre && !isCustomWidth) ? "block" : "none",
        }}
      >
        <Grid
          container
          direction={"row"}
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
            size={{ xs: 7.5, sm: 7.5, md: 7.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "100%",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 0,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            <VideoDetailsPanel
              videoId={videoId}
              data={data}
              userData={userData}
              user={user}
              channelId={channelId}
              channelName={channelName}
              subscriberCount={subscriberCount}
              owner={owner}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />

            <CommentSection
              videoId={videoId}
              data={data}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Grid>
          <Grid
            size={{ xs: 4.5, sm: 4.5, md: 4.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "426px",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 3,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            {playlistId && (
              <PlaylistContainer
                playlistId={playlistId}
                playlistData={playlistData}
                videoId={videoId}
              />
            )}
            <VideoSideBar
              shuffledVideos={shuffledVideos}
              videoId={videoId}
              listVideoData={listVideoData}
              isLoadingList={isLoadingList}
              isErrorList={isErrorList}
              errorList={errorList}
            />
          </Grid>
        </Grid>
      </Box>
        </Box>
        
      <Box
        sx={{
          width: "100%",
          display: isFullScreen ? "block" : "none",
        }}
      >
        <Grid
          container
          direction={"row"}
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
            size={{ xs: 7.5, sm: 7.5, md: 7.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "100%",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 4,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            <VideoDetailsPanel
              videoId={videoId}
              data={data}
              userData={userData}
              user={user}
              channelId={channelId}
              channelName={channelName}
              subscriberCount={subscriberCount}
              owner={owner}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />

            <CommentSection
              videoId={videoId}
              data={data}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Grid>
          <Grid
            size={{ xs: 4.5, sm: 4.5, md: 4.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "426px",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 3,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            {playlistId && (
              <PlaylistContainer
                playlistId={playlistId}
                playlistData={playlistData}
                videoId={videoId}
              />
            )}
            <VideoSideBar
              shuffledVideos={shuffledVideos}
              videoId={videoId}
              listVideoData={listVideoData}
              isLoadingList={isLoadingList}
              isErrorList={isErrorList}
              errorList={errorList}
            />
          </Grid>
        </Grid>
      </Box>
        <Box
          sx={{
            display:
              (!isCustomWidth && !isTheatre && !isFullScreen) ? "block" : "none",
          }}
        >
          <CommentSection
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        </Box>
      </Grid>
      {!(isTheatre && !isCustomWidth) && (
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
          {playlistId && (
            <PlaylistContainer
              playlistId={playlistId}
              playlistData={playlistData}
              videoId={videoId}
            />
          )}
          {isCustomWidth && (
            <VideoDetailsPanel
              videoId={videoId}
              data={data}
              userData={userData}
              user={user}
              channelId={channelId}
              channelName={channelName}
              subscriberCount={subscriberCount}
              owner={owner}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          )}

          <VideoSideBar
            shuffledVideos={shuffledVideos}
            videoId={videoId}
            listVideoData={listVideoData}
            isLoadingList={isLoadingList}
            isErrorList={isErrorList}
            errorList={errorList}
          />

          {isCustomWidth && (
            <CommentSection
              videoId={videoId}
              data={data}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          )}
          
        </Grid>
      )}

      <Box
        sx={{
          width: "100%",
          display: (isTheatre && !isCustomWidth) ? "block" : "none",
        }}
      >
        <Grid
          container
          direction={"row"}
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
            size={{ xs: 7.5, sm: 7.5, md: 7.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "100%",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 0,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            <VideoDetailsPanel
              videoId={videoId}
              data={data}
              userData={userData}
              user={user}
              channelId={channelId}
              channelName={channelName}
              subscriberCount={subscriberCount}
              owner={owner}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />

            <CommentSection
              videoId={videoId}
              data={data}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Grid>
          <Grid
            size={{ xs: 4.5, sm: 4.5, md: 4.5 }}
            sx={{
              flexGrow: isCustomWidth ? "1" : "0",
              maxWidth: "426px",
              minWidth: isCustomWidth ? "100%" : "300px!important",
              py: 3,
              px: isCustomWidth ? 3 : 0,
              pr: 3,
            }}
          >
            {playlistId && (
              <PlaylistContainer
                playlistId={playlistId}
                playlistData={playlistData}
                videoId={videoId}
              />
            )}
            <VideoSideBar
              shuffledVideos={shuffledVideos}
              videoId={videoId}
              listVideoData={listVideoData}
              isLoadingList={isLoadingList}
              isErrorList={isErrorList}
              errorList={errorList}
            />
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}

export default WatchVideo;
