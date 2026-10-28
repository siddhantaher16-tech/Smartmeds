import axios, { type InternalAxiosRequestConfig } from "axios";
import { TOKEN_KEY } from "../constants";

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  localStorage.clear();
  window.location.href = "/auth/login";
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 responses — attempt token refresh, then retry, else logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Auth endpoints return 401 for wrong credentials — never try to refresh, just propagate
    const requestUrl: string = originalRequest?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    const code = error.response?.data?.code;

    // Hard failures — no point refreshing
    if (code === "NO_TOKEN" || code === "INVALID_TOKEN") {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Already retried — give up
    if (originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Queue additional requests while a refresh is already in progress
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = "Bearer " + token;
        return api(originalRequest);
      });
    }

    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use raw axios to avoid the interceptor loop
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        { refresh_token }
      );

      const newToken: string = data.data?.access_token ?? data.access_token;
      const newRefresh: string = data.data?.refresh_token ?? data.refresh_token;

      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem("refresh_token", newRefresh);
      if (data.data?.expires_at ?? data.expires_at) {
        localStorage.setItem("expires_at", String(data.data?.expires_at ?? data.expires_at));
      }

      api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
      processQueue(null, newToken);

      originalRequest.headers["Authorization"] = "Bearer " + newToken;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
