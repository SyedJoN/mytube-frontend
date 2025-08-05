import { getCurrentUser, refreshToken } from "../apis/userFn";


export async function getCurrentUserWithAutoRefresh() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      console.log("AccessToken expired. Trying to refresh...");
      try {
        await refreshToken() 
        console.log("Token refreshed. Retrying...");
        const user = await getCurrentUser(); 
        return user;
      } catch (refreshError) {
        console.error("Refresh Token failed", refreshError);
        throw new Error("Session expired. Please login again.");
      }
    } else {
      throw error;
    }
  }
}
