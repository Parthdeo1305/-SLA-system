import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Centralised Axios instance.
 * - Automatically attaches the JWT from localStorage as a Bearer token.
 * - On 401 responses, clears the token and redirects to /login.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased to 30s for Render free-tier cold starts
});

// ── Request interceptor: inject JWT ─────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sts_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: handle auth & connection errors globally ───────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle Unauthorised (401)
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('sts_token');
      localStorage.removeItem('sts_user');
      window.location.href = '/login';
    }

    // 2. Handle Network Errors / Timeouts (Common on Render cold starts)
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('[API] Network error or timeout. Backend might be waking up.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
