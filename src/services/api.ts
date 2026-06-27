import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { JSendResponse } from "../types/api";
import { API_BASE_URL } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle JSend Errors & Auth Failures
api.interceptors.response.use(
  (response) => {
    // Return the full response for now, components can extract data
    return response;
  },
  (error: AxiosError<JSendResponse<unknown>>) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem("token");
      // Optional: Redirect to login or dispatch event
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    // Normalize error message from JSend format
    const message =
      error.response?.data?.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;
