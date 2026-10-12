// src/api/api.js
// ─────────────────────────────────────────────────────────────────────────────
// All HTTP calls to the Django backend.
//
// Cookie-based auth — how it works:
//   • On login, the backend sets two HttpOnly cookies:
//       access_token  (60 min)
//       refresh_token (7 days)
//   • Every fetch includes `credentials: "include"` so the browser
//     automatically attaches those cookies on every request.
//   • JS never reads, writes, or stores any token — they exist only
//     in HttpOnly cookies that are invisible to JavaScript.
//   • On 401, we call /auth/token/refresh/ (also cookie-based).
//     If the refresh cookie is valid, the backend sets a new access_token
//     cookie and we retry the original request.
//   • On logout, the backend blacklists both JTIs and expires the cookies.
//
// CSRF:
//   Django sets a readable 'csrftoken' cookie (non-HttpOnly).
//   We read it and send it as the X-CSRFToken header on every
//   state-changing request (POST, PATCH, PUT, DELETE).
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://16.192.77.53:8000/api"; 
// "/api";

// ── CSRF helper ───────────────────────────────────────────────────────────────
// Django's csrftoken cookie is non-HttpOnly so JS can read it.
function getCsrfToken() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return match ? match.split("=")[1] : "";
}

function csrfHeaders(method) {
  // GET and HEAD are safe methods — no CSRF token needed
  if (["GET", "HEAD"].includes(method.toUpperCase())) return {};
  return { "X-CSRFToken": getCsrfToken() };
}

// ── Core request ──────────────────────────────────────────────────────────────
const api = {

  async _request(method, path, body) {
    const opts = {
      method,
      credentials: "include",          // send + receive cookies automatically
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(method),
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    let res = await fetch(`${BASE_URL}${path}`, opts);

    // 401 → silently try to refresh the access_token cookie then retry once
    if (res.status === 401) {
      const refreshed = await api._refreshCookie();
      if (!refreshed) {
        // Refresh cookie is also expired/invalid — session is dead
        // Clear the in-memory user state and redirect to login
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return null;
      }
      // Retry original request — browser now has the new access_token cookie
      res = await fetch(`${BASE_URL}${path}`, opts);
    }

    if (!res.ok) {
      return Promise.reject(
        await res.json().catch(() => ({ detail: "Request failed" }))
      );
    }
    if (res.status === 204) return null;
    return res.json();
  },

  get:    (path)       => api._request("GET",    path),
  post:   (path, body) => api._request("POST",   path, body),
  patch:  (path, body) => api._request("PATCH",  path, body),
  delete: (path)       => api._request("DELETE", path),

  // ── Silent cookie refresh ─────────────────────────────────────────────────
  // Calls the backend refresh endpoint which reads the refresh_token cookie,
  // validates it, and sets a new access_token cookie.
  // Returns true on success, false on failure.

  async _refreshCookie() {
    try {
      const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method:      "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken":  getCsrfToken(),
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── Session restore ───────────────────────────────────────────────────────
  // Called by App.jsx on mount to check whether the user already has a valid
  // session (refresh cookie still alive from a previous login).
  // If so, fetches and returns the user profile — no tokens in JS.

  async restoreSession() {
    // First try to silently refresh the access token using the refresh cookie.
    // If that succeeds, we're authenticated. If not, the user must log in.
    const refreshed = await api._refreshCookie();
    if (!refreshed) return null;
    try {
      return await api.me();
    } catch {
      return null;
    }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  // login:  sends credentials, backend sets cookies in response
  // logout: backend blacklists JTIs + expires cookies
  // No token values are ever passed to/from these methods.

  login:  (email, password) => api.post("/auth/login/",  { email, password }),
  logout: ()                => api.post("/auth/logout/", {}),

  // ── Users ─────────────────────────────────────────────────────────────────

  me:             ()       => api.get("/users/me/"),
  updateMe:       (data)   => api.patch("/users/me/", data),
  changePw:       (data)   => api.post("/users/me/change-password/", data),
  users:          (role)   => api.get(`/users/${role ? `?role=${role}` : ""}`),
  registerUser:   (data)   => api.post("/users/register/", data),
  managerialList: ()       => api.get("/users/managerial/"),

  // ── Purchase Orders ───────────────────────────────────────────────────────

  poList:       ()                  => api.get("/po/"),
  poCreate:     (data)              => api.post("/po/", data),
  poDetail:     (id)                => api.get(`/po/${id}/`),
  poUpdate:     (id, data)          => api.patch(`/po/${id}/`, data),
  poForward:    (id, assignedTo)    => api.post(`/po/${id}/forward/`, { assigned_to: assignedTo }),
  poApprove:    (id, action, notes) => api.post(`/po/${id}/approve/`, { action, notes }),
  poEditReturn: (id, data)          => api.patch(`/po/${id}/edit-and-return/`, data),
  poSaveToDB:   (id)                => api.post(`/po/${id}/save-to-db/`, {}),
  poChanges:    (id)                => api.get(`/po/${id}/changes/`),
  poHistory:    (params)            => api.get(`/po/history/?${new URLSearchParams(params).toString()}`),

  // ── Notifications ─────────────────────────────────────────────────────────

  notifications: (unread) => api.get(`/notifications/${unread ? "?unread=1" : ""}`),
  notifRead:     (id)     => api.patch(`/notifications/${id}/read/`, {}),
  notifReadAll:  ()       => api.patch("/notifications/read-all/", {}),
  notifCount:    ()       => api.get("/notifications/unread-count/"),
};

export default api;




// // src/api/api.js
// // Cookie-based API client (NO token storage needed)

// const BASE_URL = "/api";

// const api = async (path, options = {}) => {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,

//     // 🔥 CRITICAL: sends HTTP-only cookies automatically
//     credentials: "include",

//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//   });

//   // Handle empty responses
//   if (res.status === 204) return null;

//   const data = await res.json().catch(() => ({}));

//   if (!res.ok) {
//     return Promise.reject(data);
//   }

//   return data;
// };

// export default {
//   // ── Auth ─────────────────────────────────────────────
//   login: (email, password) =>
//     api("/auth/login/", {
//       method: "POST",
//       body: JSON.stringify({ email, password }),
//     }),

//   logout: () =>
//     api("/auth/logout/", {
//       method: "POST",
//     }),

//   // ── Users ─────────────────────────────────────────────
//   me: () => api("/users/me/"),

//   updateMe: (data) =>
//     api("/users/me/", {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     }),

//   changePw: (data) =>
//     api("/users/me/change-password/", {
//       method: "POST",
//       body: JSON.stringify(data),
//     }),

//   users: (role) => {
//     const query = role ? `?role=${role}` : "";
//     return api(`/users/${query}`);
//   },

//   registerUser: (data) =>
//     api("/users/register/", {
//       method: "POST",
//       body: JSON.stringify(data),
//     }),

//   managerialList: () => api("/users/managerial/"),

//   // ── Purchase Orders ───────────────────────────────────
//   poList: () => api("/po/"),

//   poCreate: (data) =>
//     api("/po/", {
//       method: "POST",
//       body: JSON.stringify(data),
//     }),

//   poDetail: (id) => api(`/po/${id}/`),

//   poUpdate: (id, data) =>
//     api(`/po/${id}/`, {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     }),

//   poForward: (id, assignedTo) =>
//     api(`/po/${id}/forward/`, {
//       method: "POST",
//       body: JSON.stringify({ assigned_to: assignedTo }),
//     }),

//   poApprove: (id, action, notes) =>
//     api(`/po/${id}/approve/`, {
//       method: "POST",
//       body: JSON.stringify({ action, notes }),
//     }),

//   poEditReturn: (id, data) =>
//     api(`/po/${id}/edit-and-return/`, {
//       method: "PATCH",
//       body: JSON.stringify(data),
//     }),

//   poSaveToDB: (id) =>
//     api(`/po/${id}/save-to-db/`, {
//       method: "POST",
//     }),

//   poChanges: (id) => api(`/po/${id}/changes/`),

//   poHistory: (params) =>
//     api(
//       `/po/history/?${new URLSearchParams(params).toString()}`
//     ),

//   // ── Notifications ─────────────────────────────────────
//   notifications: (unread) =>
//     api(`/notifications/${unread ? "?unread=1" : ""}`),

//   notifRead: (id) =>
//     api(`/notifications/${id}/read/`, {
//       method: "PATCH",
//     }),

//   notifReadAll: () =>
//     api("/notifications/read-all/", {
//       method: "PATCH",
//     }),

//   notifCount: () => api("/notifications/unread-count/"),
// };


