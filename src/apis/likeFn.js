import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/likes"


const getVideoLikes = async (videoId) => {
    const res = await axios.get(`${BASE_URL}/video/${videoId}`);
    return res.data; 
  };

const toggleVideoLike = async (videoId) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/video/${videoId}/toggle`,
        {}, // Send an empty body if needed
        {
          withCredentials: true, // Ensure cookies are sent
        }
      );
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Something went wrong!");
    }
  }

  const toggleCommentLike = async (commentId) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/comment/${commentId}/toggle`,
        {}, // Send an empty body if needed
        {
          withCredentials: true, // Ensure cookies are sent
        }
      );
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data);
      throw new Error(error.response?.data?.message || "Something went wrong!");
    }
  }


export {getVideoLikes, toggleCommentLike, toggleVideoLike}