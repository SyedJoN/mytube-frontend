import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/videos";

const fetchVideos = async ({ queryKey }) => {
  const [, query] = queryKey;
  const res = await axios.get(`${BASE_URL}/all-videos?query=${query || ""}`, {
    withCredentials: true
  });
  return res.data;
};

const videoView = async (videoId) => {
  const res = await axios.post(`${BASE_URL}/${videoId}/view`, {});
  return res.data;
};

const fetchVideoById = async (videoId) => {
  try {
    const res = await axios.get(`${BASE_URL}/${videoId}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const publishVideo = async (formData) => {
  const res = await axios.post(`${BASE_URL}/publish-video`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log(res.data);
  return res.data;
};

export { fetchVideos, videoView, fetchVideoById, publishVideo };
