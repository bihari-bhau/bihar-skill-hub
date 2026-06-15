// src/utils/api.js
// Central API utility — all requests go through here.
// Automatically attaches JWT token, handles 401 (token expired), and detects
// network/backend-unreachable failures so the UI can show a connection-error page.

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8000/api";

export function getToken() {
  return localStorage.getItem("access_token");
}

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function setAuth(data) {
  localStorage.setItem("access_token",  data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { clearAuth(); return null; }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch {
    clearAuth();
    return null;
  }
}

// Custom error class so callers can distinguish a backend-unreachable failure
// from a normal HTTP response. ConnectionError.jsx listens for this.
export class NetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "NetworkError";
    this.isNetworkError = true;
  }
}

export async function apiFetch(path, options = {}) {
  let token = getToken();

  const makeRequest = (t) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options.headers,
      },
    });

  let res;
  try {
    res = await makeRequest(token);
  } catch (e) {
    // fetch() rejects only on network failure (DNS, offline, CORS, server unreachable).
    // Emit a global event the app can listen to and show the connection-error page.
    window.dispatchEvent(new CustomEvent("api:network-error", { detail: { path } }));
    throw new NetworkError(e.message);
  }

  // Auto-refresh on 401
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      try {
        res = await makeRequest(token);
      } catch (e) {
        window.dispatchEvent(new CustomEvent("api:network-error", { detail: { path } }));
        throw new NetworkError(e.message);
      }
    }
  }

  // 5xx from the server is "the backend is alive but broken" — treat as a
  // recoverable connection issue too, so cold-start 502s on Render show the
  // friendly page instead of a generic error.
  if (res.status >= 502 && res.status <= 504) {
    window.dispatchEvent(new CustomEvent("api:network-error", { detail: { path, status: res.status } }));
  }

  return res;
}

// Convenience wrappers
export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: "POST",   body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: "PATCH",  body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: "DELETE" }),
};