import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1/users"


const getCurrentUser = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/current-user`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Axios Error:", error.response?.data); // Log the actual response
    throw new Error(
      error.response?.data?.message || "Something went wrong. Please try again!"
    );
  }
};

const getUserChannelProfile = async (username) => {
    const res = await axios.get(`${BASE_URL}/channel/${username}`, { 
        withCredentials: true 
    });
    return res.data;
};



  const registerUser = async (data) => {
    try {
      console.log(data)
      const res = await axios.post(`${BASE_URL}/register`, data);
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data); // Log the actual response
  
      throw new Error(
        error.response?.data?.message || "Something went wrong. Please try again!"
      );
    }
  };

  const loginUser = async (data) => {
    try {
      console.log(data)

      const res = await axios.post(`${BASE_URL}/login`, data, {

        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data); // Log the actual response
  
      throw new Error(
        error.response?.data?.message || "Something went wrong. Please try again!"
      );
    }
  };

   const addToWatchHistory = async (data) => {
    try {
      console.log("pohanch gai", data)
      const res = await axios.post(`${BASE_URL}/history`, data, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data); // Log the actual response
  
      throw new Error(
        error.response?.data?.message || "Something went wrong. Please try again!"
      );
    }
  };


  const logoutUser = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/logout`, {}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Axios Error:", error.response?.data); // Log the actual response
  
      throw new Error(
        error.response?.data?.message || "Something went wrong. Please try again!"
      );
    }
  };




export {getCurrentUser, getUserChannelProfile, registerUser, loginUser, logoutUser, addToWatchHistory}