const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendHost = BASE_URL.replace(/\/api$/, '');
  return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
};


let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const setAccessToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
};

interface FetchOptions extends RequestInit {
  bodyData?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  // Add Auth token
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Handle json payload formatting
  let body = options.body;
  if (options.bodyData) {
    if (options.bodyData instanceof FormData) {
      body = options.bodyData;
      // Do not set Content-Type header when using FormData; fetch handles boundary automatically!
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.bodyData);
    }
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Handle Token Expiration and Refresh (401 status code)
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    if (endpoint.includes('/auth/refresh')) {
      // Refresh itself failed, clear credentials
      setAccessToken(null);
      throw new Error('Session expired');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // credentials include HttpOnly cookies
          credentials: 'omit', // Wait, fetch by default doesn't send cookies unless credentials is 'include'
        });

        // Try credentials include (CORS + Cookies)
        const refreshResWithCreds = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResWithCreds.ok) {
          const resJson = await refreshResWithCreds.json();
          const newAccessToken = resJson.data.accessToken;
          setAccessToken(newAccessToken);
          isRefreshing = false;
          onRefreshed(newAccessToken);
        } else {
          isRefreshing = false;
          setAccessToken(null);
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }
      } catch (err) {
        isRefreshing = false;
        setAccessToken(null);
        window.location.href = '/login';
        throw err;
      }
    }

    // Wait for the refresh to complete and retry the request
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async (newToken) => {
        try {
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          if (options.bodyData && !(options.bodyData instanceof FormData)) {
            retryHeaders.set('Content-Type', 'application/json');
          }
          const retryRes = await fetch(url, { ...options, headers: retryHeaders, body });
          if (!retryRes.ok) {
            const errorData = await retryRes.json().catch(() => ({}));
            reject(new Error(errorData.message || 'Request failed after refresh'));
          } else {
            resolve(await retryRes.json());
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}
