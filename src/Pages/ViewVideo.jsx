import React from 'react';
import VideoPlayer from '../Components/VideoPlayer';
import { useParams } from '@tanstack/react-router'; // ✅ Correct way to get route params



function ViewVideo({videoId}) {

  return (
    <>
      <VideoPlayer videoId={videoId} />
    </>
  );
}

export default ViewVideo;
