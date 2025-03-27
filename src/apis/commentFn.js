import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/comments"


const getVideoComments = async (videoId) => {
    const res = await axios.get(`${BASE_URL}/get/${videoId}`);
    return res.data; 
  };


export {getVideoComments}