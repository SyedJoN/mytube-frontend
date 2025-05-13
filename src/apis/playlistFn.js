import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/playlists";

const fetchUserPlaylists = async (userId) => {
  const res = await axios.get(`${BASE_URL}/playlists/user/${userId}`);
  return res.data;
};

// const videoView = async (videoId) => {
//   const res = await axios.post(`${BASE_URL}/${videoId}/view`, {})
//   return res.data;
// }

// const fetchVideoById = async (videoId) => {
//     const res = await axios.get(`${BASE_URL}/${videoId}`);
//     return res.data; // ✅ No need for resolve()
//   };

// const publishVideo = async(formData) => {
//     const res = await axios.post(`${BASE_URL}/publish-video`, formData, {
//         headers: {
//             'Content-Type' : 'multipart/form-data'
//         }
//     });
//     console.log(res.data)
//     return res.data;
// }

export { fetchUserPlaylists };
