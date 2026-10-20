const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const getAccessToken = () => localStorage.getItem('cpe_access_token');
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('cpe_access_token', token);
  } else {
    localStorage.removeItem('cpe_access_token');
  }
};

/**
 * Universal Request Wrapper with automatic auth header and token refresh
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const token = getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies (cpe_refresh_token)
  };

  try {
    const response = await fetch(url, config);

    // If 401 Unauthorized and not already refreshing or calling auth endpoints
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/register')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.data?.accessToken;
            if (newToken) {
              setAccessToken(newToken);
              processQueue(null, newToken);
              isRefreshing = false;
              // Retry original request with new token
              headers['Authorization'] = `Bearer ${newToken}`;
              return apiRequest(endpoint, { ...options, headers });
            }
          }
          // Refresh failed
          processQueue(new Error('Session expired'), null);
          setAccessToken(null);
          isRefreshing = false;
        } catch (err) {
          processQueue(err, null);
          setAccessToken(null);
          isRefreshing = false;
        }
      } else {
        // Wait in queue
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken) => {
              headers['Authorization'] = `Bearer ${newToken}`;
              resolve(apiRequest(endpoint, { ...options, headers }));
            },
            reject: (err) => reject(err),
          });
        });
      }
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  patch: (endpoint, body, options) => apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
