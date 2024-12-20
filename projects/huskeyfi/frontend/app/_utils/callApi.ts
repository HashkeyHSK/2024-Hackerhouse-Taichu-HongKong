export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  offset: null | number;
  limit?: number;
  error?: string;
}

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiOptions = {
  endpoint: string;
  method?: ApiMethod;
  body?: any;
  params?: Record<string, string | number | boolean>;
  token?: string | null;
  options?: any;
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const callApi = async <T>({
  endpoint,
  method = "GET",
  body = {},
  params = {},
  token = null,
  options = {},
}: ApiOptions): Promise<ApiResponse<T>> => {
  try {
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const url = `${baseUrl}${endpoint}${queryString}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : null,
      next: options,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok (status: ${response.status})`,
      );
    }

    const responseData: ApiResponse<T> = await response.json();
    return responseData;
  } catch (error) {
    console.error(`API call failed: ${error}`);
    throw new Error(`API call failed: ${error}`);
  }
};
