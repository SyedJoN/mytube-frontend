import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import VideoPlayer from "../Components/Video/VideoPlayer";
import { useNavigate } from "@tanstack/react-router"; 
import { Grid, useMediaQuery } from "@mui/material";
import VideoDetailsPanel from "../Components/Video/VideoDetailsPanel";
import { useQuery } from "@tanstack/react-query";
import { fetchVideoById, fetchVideos } from "../apis/videoFn";
import { OpenContext, UserInteractionContext, useUserInteraction } from "../routes/__root";
import CommentSection from "../Components/Comments/CommentSection";
import PlaylistContainer from "../Components/Video/PlaylistContainer";
import VideoSideBar from "../Components/Video/VideoSideBar";
import { shuffleArray } from "../helper/shuffle";
import { fetchPlaylistById } from "../apis/playlistFn";
import { getUserChannelProfile } from "../apis/userFn";

function WatchVideo({ videoId, playlistId }) {
  const navigate = useNavigate();
  const context = useContext(OpenContext);
  const [index, setIndex] = useState(0);
  const { data: dataContext } = context ?? {};
const { isUserInteracted, setIsUserInteracted } = useUserInteraction();
  const isAuthenticated = dataContext || null;
  const [activeAlertId, setActiveAlertId] = useState(null);

  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
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
  });

  const videos = listVideoData?.data?.docs || [];
  const filteredVideos = useMemo(() => {
    const filtered = videos.filter((video) => video._id !== videoId);
    return shuffleArray(filtered);
  }, [videoId, videos]);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["channelProfile", user],
    queryFn: () => getUserChannelProfile(user),
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
    enabled: !!playlistId,
  });

  const playlistVideos = playlistData?.data?.videos || [];
  useEffect(() => {
    const playIndex = playlistVideos?.findIndex(
      (video) => video._id === videoId
    );
    setIndex(playIndex);
  }, [playlistVideos]);

  const handleNextVideo = useCallback(() => {
    if (!playlistId) {
      navigate({
        to: "/watch",
        search: { v: filteredVideos[0]?._id },
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
  }, [navigate, playlistId, filteredVideos, playlistVideos, index]);
  return (
    <Grid
      container
      direction={isCustomWidth ? "column" : "row"}
      spacing={0}
      sx={{
        flexWrap: "noWrap",
        justifyContent: !isCustomWidth ? "center" : "flex-start",
        alignItems: isCustomWidth ? "center" : "flex-start",
        flexGrow: 1,
      }}
    >
      <Grid
        size={{ xs: 12, sm: 11.5, md: 8 }}
        sx={{ p: 3, width: isCustomWidth ? "100%!important" : "" }}
      >
        <VideoPlayer
        isUserInteracted={isUserInteracted}
        setIsUserInteracted={setIsUserInteracted}
          dataContext={dataContext}
          isAuthenticated={isAuthenticated}
          index={index}
          videoId={videoId}
          playlistId={playlistId}
          playlistVideos={playlistVideos}
          filteredVideos={filteredVideos}
          handleNextVideo={handleNextVideo}
        />
        {!isCustomWidth && (
          <VideoDetailsPanel
            videoId={videoId}
            data={data}
            isAuthenticated={isAuthenticated}
            dataContext={dataContext}
            userData={userData}
            user={user}
            channelId={channelId}
            channelName={channelName}
            subscriberCount={subscriberCount}
            ower={owner}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}
        {!isCustomWidth && (
          <CommentSection
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}
      </Grid>

      <Grid
        size={{ xs: 12, sm: 12, md: 4 }}
        sx={{
          flexGrow: isCustomWidth ? "1" : "0",
          maxWidth: "426px!important",
          minWidth: isCustomWidth ? "100%" : "300px!important",
          py: isCustomWidth ? 0 : 3,
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
            ower={owner}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}

        <VideoSideBar
          filteredVideos={filteredVideos}
          videoId={videoId}
          listVideoData={listVideoData}
          isLoadingList={isLoadingList}
          isErrorList={isErrorList}
          errorList={errorList}
        />
        {isCustomWidth && (
          <CommentSection
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default WatchVideo;
