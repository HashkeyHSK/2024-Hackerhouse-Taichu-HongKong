// Interface for API response structure with generic type T
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  offset: null | number;
  limit?: number;
  error?: string;
}

// Type for HTTP methods supported by the API
type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Type for API call options/parameters
type ApiOptions = {
  endpoint: string; // API endpoint path
  method?: ApiMethod; // HTTP method to use
  body?: any; // Request body data
  params?: Record<string, string | number | boolean>; // URL query parameters
  token?: string | null; // Authentication token
  options?: any; // Additional fetch options
};

// Base URL for API calls from environment variables
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Generic API call function that handles requests and responses
export const callApi = async <T>({
  endpoint,
  method = "GET",
  body = {},
  params = {},
  token = null,
  options = {},
}: ApiOptions): Promise<ApiResponse<T>> => {
  try {
    // Build query string from params if any exist
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const url = `${baseUrl}${endpoint}${queryString}`;

    // Set up request headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make the API request
    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : null,
      next: options,
      cache: "no-store",
    });

    console.log("response", response);

    // Handle non-200 responses
    if (!response.ok) {
      throw new Error(
        `Network response was not ok (status: ${response.status})`,
      );
    }

    // Parse and return response data
    const responseData: ApiResponse<T> = await response.json();
    return responseData;
  } catch (error) {
    // Log and re-throw any errors that occur
    console.error(`API call failed: ${error}`);
    throw new Error(`API call failed: ${error}`);
  }
};
