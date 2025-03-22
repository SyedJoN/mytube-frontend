import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/videos"

const fetchVideos = async () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const res = await axios.get(`${BASE_URL}/all-videos`);
      resolve(res.data);
    }, 3000); // ⏳ Adds a 3-second delay
  });
};

const videoView = async (videoId) => {
  const res = await axios.post(`${BASE_URL}/${videoId}/view`, {})
  return res.data;
}

const fetchVideoById = async (videoId) => {
    const res = await axios.get(`${BASE_URL}/${videoId}`);
    return res.data; // ✅ No need for resolve()
  };

const publishVideo = async(formData) => {
    const res = await axios.post(`${BASE_URL}/publish-video`, formData, {
        headers: {
            'Content-Type' : 'multipart/form-data'
        }
    });
    console.log(res.data)
    return res.data; 
}


export {fetchVideos, videoView, fetchVideoById, publishVideo}