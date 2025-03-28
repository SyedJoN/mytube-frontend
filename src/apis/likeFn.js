import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/likes"


const getVideoLikes = async (videoId) => {
    const res = await axios.get(`${BASE_URL}/video/${videoId}`);
    return res.data; 
  };

  const toggleCommentLike = async (commentId) => {
    const res = await axios.patch(`${BASE_URL}/comment/${commentId}/toggle`)
    return res.data;
  }


export {getVideoLikes, toggleCommentLike}