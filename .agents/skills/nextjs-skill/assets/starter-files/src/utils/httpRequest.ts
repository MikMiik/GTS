import { ApiResponse } from "@/types/api";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/bff";

const httpRequest = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let tokenListeners: Array<(success: boolean) => void> = [];

httpRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const shouldRenewToken = error.response?.status === 401;

    if (shouldRenewToken && !originalConfig._retry) {
      if (!isRefreshing) {
        originalConfig._retry = true;
        isRefreshing = true;

        try {
          await axios.post(
            `${baseURL}/api/auth/refresh`,
            {},
            { withCredentials: true, timeout: 10000 },
          );

          tokenListeners.forEach((listener) => listener(true));
          isRefreshing = false;
          tokenListeners = [];

          return httpRequest(originalConfig);
        } catch {
          tokenListeners.forEach((listener) => listener(false));
          isRefreshing = false;
          tokenListeners = [];
        }
      } else {
        return new Promise((resolve, reject) => {
          tokenListeners.push((success: boolean) => {
            if (success) {
              resolve(httpRequest(originalConfig));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    return Promise.reject(error);
  },
);

const request = async <T>(
  method: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const isPutOrPatch = ["put", "patch"].includes(method.toLowerCase());
    const effectiveMethod = isPutOrPatch ? "post" : method;
    const effectivePath = isPutOrPatch
      ? `${url}${url.includes("?") ? "&" : "?"}_method=${method}`
      : url;

    const response = await httpRequest.request({
      method: effectiveMethod,
      url: effectivePath,
      data,
      ...config,
    });

    return response.data;
  } catch (error) {
    console.error("HTTP Request Error:", error);
    const axiosError = error as AxiosError;
    return axiosError.response?.data as T;
  }
};

export const get = <T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request("GET", url, null, config);

export const post = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request("POST", url, data, config);

export const put = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request("PUT", url, data, config);

export const patch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request("PATCH", url, data, config);

export const remove = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request("DELETE", url, data, config);

export default httpRequest;
