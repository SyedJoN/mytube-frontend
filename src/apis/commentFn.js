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
const updateComment = async (videoId, data) => {
  const res = await axios.patch(`${BASE_URL}/update/${videoId}/${data.commentId}`, data, {
    withCredentials: true,
  });
  return res.data;
};

const deleteComment = async (videoId, data) => {
  const res = await axios.delete(`${BASE_URL}/delete/${videoId}/${data.commentId}`, {
    withCredentials: true,
    data: data,
  });
  return res.data;
};


export { getVideoComments, addComment, updateComment, deleteComment };
