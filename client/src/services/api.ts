import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) return error.response.data.message;

    const response = error.response;
    const contentType = String(response?.headers["content-type"] ?? "");
    const isProxyUnavailable = response?.status === 500
      && contentType.includes("text/plain");

    if (isProxyUnavailable || error.code === "ERR_NETWORK" || !response) {
      return "The CareConnect API is not available yet. Start the server on port 4000 and try again. Your details were not submitted.";
    }
  }

  return "We could not complete that request. Please try again.";
}