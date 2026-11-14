import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: check if current browser URL is a public route that does not require forced /login redirect
const isPublicPathname = (pathname: string): boolean => {
  return (
    pathname === '/' ||
    pathname === '/dashboard' ||
    pathname === '/documents' ||
    (pathname.startsWith('/documents/') && pathname !== '/documents/upload') ||
    pathname === '/search' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  );
};

// Single-flight Refresh Token Queue to prevent concurrent 401 race conditions
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const subscribeTokenRefresh = (resolve: (token: string) => void, reject: (err: any) => void) => {
  refreshSubscribers.push({ resolve, reject });
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (err: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(err));
  refreshSubscribers = [];
};

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartdoc_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401 cleanly
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl: string = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('smartdoc_refresh_token');

      if (!refreshToken) {
        // No refresh token available: clear any stale user/access token state
        localStorage.removeItem('smartdoc_access_token');
        localStorage.removeItem('smartdoc_user');
        window.dispatchEvent(new Event('smartdoc:auth-expired'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the ongoing refresh request to complete, then retry with the new token
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (newToken: string) => {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            (refreshErr: any) => {
              reject(refreshErr);
            }
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = res.data.data;

        localStorage.setItem('smartdoc_access_token', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('smartdoc_refresh_token', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('smartdoc_user', JSON.stringify(user));
        }

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        onRefreshFailed(refreshErr);

        // Refresh failed definitively: clear session & notify AuthContext
        localStorage.removeItem('smartdoc_access_token');
        localStorage.removeItem('smartdoc_refresh_token');
        localStorage.removeItem('smartdoc_user');
        window.dispatchEvent(new Event('smartdoc:auth-expired'));

        if (!isPublicPathname(window.location.pathname)) {
          const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?redirect=${redirectUrl}`;
        }

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
