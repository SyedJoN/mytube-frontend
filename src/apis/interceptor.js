import axios from 'axios';
import { refreshToken } from '../apis/userFn';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

const broadcastChannel = new BroadcastChannel('auth_channel');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          console.log("🔄 Attempting token refresh...");
          await refreshToken();  // <- Make refresh token API call

          processQueue(null);
          resolve(api(originalRequest));  // Retry original request
        } catch (refreshError) {
          console.error("🔴 Refresh token failed:", refreshError);
          processQueue(refreshError);
          broadcastChannel.postMessage({ type: 'LOGOUT' });
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
