const AUTH_STORAGE_KEY = "chef-ai-auth"
// In development, requests go through Vite's same-origin proxy to avoid CORS.
// Production uses the configured public API URL (or a same-origin /api/v1 proxy).
// `/auth-api` avoids Vercel's reserved `/api/*` serverless-function namespace.
const API_BASE_URL = (import.meta.env.DEV ? "/auth-api" : (import.meta.env.VITE_AUTH_API_URL || "/api/v1")).replace(/\/$/, "")

function getErrorMessage(payload, fallback) {
  if (typeof payload === "string" && payload.trim()) return payload
  if (payload && typeof payload.message === "string" && payload.message.trim()) return payload.message
  if (payload && typeof payload.detail === "string" && payload.detail.trim()) return payload.detail
  if (payload && typeof payload.error === "string" && payload.error.trim()) return payload.error
  return fallback
}

async function readResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new Error("Unable to reach the authentication service. Check VITE_AUTH_API_URL and that the backend is running.")
  }

  const payload = await readResponse(response)
  if (!response.ok) throw new Error(getErrorMessage(payload, `Authentication request failed (HTTP ${response.status}).`))
  return payload
}

export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    return session?.accessToken && session?.refreshToken ? session : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getUserFromToken(token) {
  try {
    const [, encodedPayload] = token.split(".")
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")))
    return { email: payload.sub || "Chef AI member", name: payload.firstname || payload.name || "" }
  } catch {
    return { email: "Chef AI member", name: "" }
  }
}

function toSession(payload) {
  if (!payload?.access_token || !payload?.refresh_token) {
    throw new Error("The authentication service returned an invalid token response.")
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    user: getUserFromToken(payload.access_token),
  }
}

export async function login(credentials) {
  const payload = await request("/auth/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
  return toSession(payload)
}

export async function register(details) {
  await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...details, role: "USER" }),
  })
}

export async function verifyEmail(token) {
  if (!token) throw new Error("The verification link is missing its token.")
  await request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function logout(session) {
  if (!session?.accessToken) return

  await request("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
}

export async function refreshSession(session) {
  const payload = await request("/auth/refresh-token", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.refreshToken}` },
  })
  return toSession(payload)
}

// Use this helper for any future protected Chef AI API endpoints.
// It refreshes an expired access token once, then retries the request.
export async function authenticatedFetch(path, options = {}) {
  let session = loadSession()
  if (!session) throw new Error("Your session has ended. Please sign in again.")

  const send = (token) => fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  })

  let response = await send(session.accessToken)
  if (response.status !== 401 && response.status !== 403) return response

  try {
    session = await refreshSession(session)
    saveSession(session)
  } catch {
    clearSession()
    throw new Error("Your session has ended. Please sign in again.")
  }

  response = await send(session.accessToken)
  return response
}
