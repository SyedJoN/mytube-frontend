import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/likes"


const getVideoLikes = async (videoId) => {
    const res = await axios.get(`${BASE_URL}/video/${videoId}`);
    return res.data; 
  };


export {getVideoLikes}