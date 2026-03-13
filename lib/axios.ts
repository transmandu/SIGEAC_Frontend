import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    skip_zrok_interstitial: true,
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');

  if (token) {
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = authHeader;
  }

  return config;
});

export default axiosInstance;
