import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/comments";

const getVideoComments = async (videoId) => {
  const res = await axios.get(`${BASE_URL}/get/${videoId}`);
  return res.data.data;
};

const addComment = async (videoId, data) => {
  const res = await axios.post(`${BASE_URL}/post/${videoId}`, data, {
    withCredentials: true,
  });
  return res.data;
};

export { getVideoComments, addComment };
