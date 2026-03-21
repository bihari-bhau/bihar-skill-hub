// src/utils/api.js
// Central API utility — all requests go through here.
// Automatically attaches JWT token and handles 401 (token expired).

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

  let res = await makeRequest(token);

  // Auto-refresh on 401
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) res = await makeRequest(token);
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
