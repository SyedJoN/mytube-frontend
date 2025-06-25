import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import VideoPlayer from "../Components/Video/VideoPlayer";
import { useNavigate } from "@tanstack/react-router";
import { Grid, useMediaQuery } from "@mui/material";
import VideoDetailsPanel from "../Components/Video/VideoDetailsPanel";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchVideoById, fetchVideos } from "../apis/videoFn";
import {Box} from "@mui/material";
import {
  OpenContext,
  UserInteractionContext,
  useUserInteraction,
} from "../routes/__root";
import CommentSection from "../Components/Comments/CommentSection";
import PlaylistContainer from "../Components/Video/PlaylistContainer";
import VideoSideBar from "../Components/Video/VideoSideBar";
import { shuffleArray } from "../helper/shuffle";
import { fetchPlaylistById } from "../apis/playlistFn";
import { getUserChannelProfile } from "../apis/userFn";

function WatchVideo({ videoId, playlistId }) {
  const navigate = useNavigate();
    const { isUserInteracted, setIsUserInteracted } = useUserInteraction();
  
  const context = useContext(OpenContext);
  const [index, setIndex] = useState(0);
  const { data: dataContext } = context ?? {};
  const isAuthenticated = dataContext || null;
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [isTheatre, setIsTheatre] = useState(false);
const queryClient = useQueryClient();
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
useEffect(() => {
  console.log("isUserInteracted in /watch:", isUserInteracted);
}, [isUserInteracted]);

  return (
    <Grid
      container
      direction={isCustomWidth || isTheatre ? "column" : "row"}
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
        sx={{
          p: isTheatre ? 0 : 3,
          width: isCustomWidth || isTheatre ? "100%!important" : "",
        }}
      >
        <VideoPlayer
          index={index}
          videoId={videoId}
          playlistId={playlistId}
          playlistVideos={playlistVideos}
          filteredVideos={filteredVideos}
          handleNextVideo={handleNextVideo}
          isTheatre={isTheatre}
          setIsTheatre={setIsTheatre}
        />
      
         <Box sx={{ display: (!isCustomWidth && !isTheatre) ? 'block' : 'none', mt: 2 }}>
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
   <Box sx={{ display: (!isCustomWidth && !isTheatre) ? 'block' : 'none' }}>
          <CommentSection
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        </Box>
      </Grid>
    {!(isTheatre && !isCustomWidth) &&
      <Grid
          size={{ xs: 12, sm: 12, md: 4 }}
          sx={{
            flexGrow: isCustomWidth ? "1" : "0",
            maxWidth: "426px!important",
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
            filteredVideos={filteredVideos}
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
    }
      
        <Box sx={{width: "100%", display: isTheatre && !isCustomWidth ? "block" : "none"}}>
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
              py: isCustomWidth ? 0 : 3,
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
              filteredVideos={filteredVideos}
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
