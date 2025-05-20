import React from 'react';
import VideoPlayer from '../Components/VideoPlayer';
import { useParams } from '@tanstack/react-router'; // ✅ Correct way to get route params



function ViewVideo({videoId, playlistId}) {

  return (
    <>
      <VideoPlayer videoId={videoId} playlistId={playlistId} />
    </>
  );
}

export default ViewVideo;
