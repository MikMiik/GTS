import { ApiResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/bff";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | string[] | number | boolean | undefined | null>;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const { params, ...fetchOptions } = options;
    let url = `${BASE_URL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    const response = await fetch(url, fetchOptions);

    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch {
      return { success: false, message: "Empty or invalid response" };
    }

    if (!response.ok) {
      return { success: false, message: json.message ?? "Request failed" };
    }

    return json;
  } catch (error) {
    console.error("Fetch error:", error);
    return { success: false, message: "Network error" };
  }
}
