import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/subscriptions"


const toggleSubscription = async (channelId) => {
    const res = await axios.patch(`${BASE_URL}/${channelId}/toggle`, {}, {
      withCredentials: true
    });
    return res.data; 
  };


export {toggleSubscription}