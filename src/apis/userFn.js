import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/users"


const getUserChannelProfile = async (username) => {
    const res = await axios.get(`${BASE_URL}/channel/${username}`);
    return res.data; 
  };


export {getUserChannelProfile}