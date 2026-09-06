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
  const isAuthenticationRequest = path.endsWith("/auth/authenticate")
  if (isAuthenticationRequest && (response.status === 401 || response.status === 403)) {
    throw new Error("Email or password is incorrect.")
  }
  if (isAuthenticationRequest && response.status === 423) {
    throw new Error("This account is temporarily locked after too many failed sign-in attempts. Please try again later.")
  }
  if (isAuthenticationRequest && response.status === 429) {
    throw new Error("Too many sign-in attempts. Please wait a moment and try again.")
  }
  if (path.endsWith("/auth/register") && response.status === 403) {
    throw new Error("An account with this email already exists. Use the reset password option to recover access.")
  }
  if (path.endsWith("/auth/forgot-password") && (response.status === 401 || response.status === 403)) {
    throw new Error("We couldn't send the reset link. Please check the email address and try again.")
  }
  if (!response.ok) throw new Error(getErrorMessage(payload, `Authentication request failed (HTTP ${response.status}).`))
  return payload
}

export function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))
    if (!session?.accessToken || !session?.refreshToken) return null

    const tokenUser = getUserFromToken(session.accessToken)
    const migratedSession = {
      ...session,
      user: {
        ...session.user,
        ...tokenUser,
        firstname: tokenUser.firstname || session.user?.firstname || "",
        lastname: tokenUser.lastname || session.user?.lastname || "",
        name: tokenUser.name || session.user?.name || "",
      },
    }
    saveSession(migratedSession)
    return migratedSession
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
    const base64Payload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/")
    const paddedPayload = `${base64Payload}${"=".repeat((4 - (base64Payload.length % 4)) % 4)}`
    const payload = JSON.parse(atob(paddedPayload))
    const firstname = payload.firstname || payload.firstName || ""
    const lastname = payload.lastname || payload.lastName || ""
    return {
      email: payload.sub || "Chef AI member",
      firstname,
      lastname,
      name: [firstname, lastname].filter(Boolean).join(" ") || payload.name || "",
    }
  } catch {
    return { email: "Chef AI member", firstname: "", lastname: "", name: "" }
  }
}

function toSession(payload, fallbackUser = {}) {
  if (!payload?.access_token || !payload?.refresh_token) {
    throw new Error("The authentication service returned an invalid token response.")
  }

  const tokenUser = getUserFromToken(payload.access_token)
  const firstname = tokenUser.firstname || fallbackUser.firstname || ""
  const lastname = tokenUser.lastname || fallbackUser.lastname || ""

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    user: {
      ...fallbackUser,
      ...tokenUser,
      firstname,
      lastname,
      name: [firstname, lastname].filter(Boolean).join(" ") || tokenUser.name || fallbackUser.name || "",
    },
  }
}

export async function login(credentials) {
  try {
    const payload = await request("/auth/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return toSession(payload)
  } catch (error) {
    if (/Authentication request failed \(HTTP (401|403)\)/.test(error.message || "")) {
      throw new Error("Email or password is incorrect.", { cause: error })
    }
    throw error
  }
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

export async function requestPasswordReset(email) {
  await request("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(details) {
  await request("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
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
  return toSession(payload, session.user)
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

export async function getSavedRecipes() {
  const response = await authenticatedFetch("/history")
  return response.json()
}

export async function saveRecipeHistory(id, html, ingredients) {
  return authenticatedFetch("/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, html, ingredients }),
  })
}

export async function deleteRecipeHistory(id) {
  return authenticatedFetch(`/history/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function updateProfile(profile) {
  return authenticatedFetch("/users/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })
}

export async function changePassword(passwords) {
  return authenticatedFetch("/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwords),
  })
}

export async function deleteAccount() {
  return authenticatedFetch("/users/me", { method: "DELETE" })
}
