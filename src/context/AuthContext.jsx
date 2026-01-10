/**
 * COOKIE HTTPONLY
 * - I cookie vengono inviati con `credentials: "include"`
 * - Login/Signup/Logout gestiti lato server
 * - Il refresh viene eseguito automaticamente dal hook useAuthFetch
 */

import { createContext, useContext, useEffect, useState } from 'react';
import useAuthFetch from "@/hooks/useAuthFetch";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  // Hook per fetch protette (gestisce refresh token)
  const { authFetch, setAccessToken, logout } = useAuthFetch({ setUser });

  // --- LOGIN AUTOMATICO AL CARICAMENTO ---
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const res = await authFetch("/api/auth/refresh", { method: "POST" });
        if (res.token) setAccessToken(res.token);
        if (res.user) setUser(res.user);
        if (res.subscription) setSubscription(res.subscription);
      } catch {
        // Non loggato, lascia user=null
      }
    };
    tryAutoLogin();
  }, []);

  /* ================================ */
  /* ======= AUTH FUNCTIONS ========= */
  /* ================================ */

  // --- LOGIN UTENTE ---
  const login = async (email, password) => {
    const res = await authFetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.token) setAccessToken(res.token);
    if (res.user) setUser(res.user);
    if (res.subscription) setSubscription(res.subscription);

    return res;
  };

  // --- REGISTRAZIONE UTENTE ---
  const signin = async (email, password) => {
    const res = await authFetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.user) setUser(res.user);
    if (res.subscription) setSubscription(res.subscription);
    if (res.token) setAccessToken(res.token); // opzionale, se server emette token temporaneo

    return res;
  };

  // --- CONFERMA PAGAMENTO SUBSCRIPTION ---
  const confirmPayment = async ({ provider, paymentId, subscriptionId }) => {
    const res = await authFetch("/api/auth/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, paymentId, subscriptionId })
    });

    if (res.subscription) setSubscription(res.subscription);
    return res;
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSubscription(null);
  };

  // Wrapper fetch con gestione errori
  const safeFetch = async (path, options = {}) => {
    try {
      // Chiama authFetch, che gestisce token, refresh e logout
      const response = await authFetch(path, options);

      // authFetch potrebbe restituire JSON o blob
      // Se options.responseType === 'blob', forza blob
      if (options.responseType === "blob") {
        return response; // authFetch già restituisce blob
      }

      return response; // altrimenti JSON
    } catch (err) {
      console.error("Errore API:", err);
      throw err;
    }
  };

  /* ================================ */
  /* ======= USER FUNCTIONS ========= */
  /* ================================ */

  const getCalendarEvents = (year, month) =>
    safeFetch(`/api/user/events/month?year=${year}&month=${month}`);

  const getDayEvents = (year, month, day) =>
    safeFetch(`/api/user/events/day?year=${year}&month=${month}&day=${day}`);

  const bookEvent = (eventId) =>
    safeFetch(`/api/user/events/book`, {
      method: "POST",
      body: JSON.stringify({ eventId }),
    });

  const cancelEventBooking = (eventId) =>
    safeFetch(`/api/user/events/cancel`, {
      method: "POST",
      body: JSON.stringify({ eventId }),
    });

  /* ================================ */
  /* ======= ADMIN FUNCTIONS ======== */
  /* ================================ */

  const createUser = (userData) =>
    safeFetch(`/api/admin/users`, {
      method: "POST",
      body: JSON.stringify(userData),
    });

  const updateUser = (userId, userData) =>
    safeFetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
  });

  const getAllUsers = () =>
    safeFetch(`/api/admin/users`);

  const disableUser = (userId) =>
    safeFetch(`/api/admin/users/${userId}`, { method: "DELETE" });

  const getUserStatuses = () =>
    safeFetch(`/api/admin/users/statuses`);

  const createEvent = (eventData) =>
    safeFetch(`/api/admin/events`, {
      method: "POST",
      body: JSON.stringify(eventData),
    });

  const updateEvent = (eventId, eventData) =>
    safeFetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify(eventData),
    });

  const cancelEvent = (eventId) =>
    safeFetch(`/api/admin/events/${eventId}`, { method: "DELETE" });

  const createSubscriptionAdmin = (subscriptionData) =>
    safeFetch(`/api/admin/subscriptions`, {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });

  const createGroup = (groupData) =>
    safeFetch(`/api/admin/groups`, {
      method: "POST",
      body: JSON.stringify(groupData),
    });

  const getAllGroups = () =>
    safeFetch(`/api/admin/groups`);

  const downloadQuadrimestre = async () => {
    try {
      const blob = await safeFetch("/api/admin/download", {
        method: "GET",
        responseType: "blob", // forza blob
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quadrimestre.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Errore nel download del file");
    }
  };

  const uploadQuadrimestre = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await safeFetch("/api/admin/upload", {
        method: "POST",
        body: formData, // authFetch sa gestire FormData
      });

      alert("File caricato correttamente!");
      return res;

    } catch (err) {
      console.error(err);
      alert("Errore nel caricamento del file");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        login,
        signin,
        confirmPayment,
        handleLogout,
        getCalendarEvents,
        getDayEvents,
        bookEvent,
        cancelEventBooking,
        createUser,
        updateUser,
        getAllUsers,
        disableUser,
        getUserStatuses,
        createEvent,
        updateEvent,
        cancelEvent,
        createSubscriptionAdmin,
        createGroup,
        getAllGroups,
        downloadQuadrimestre,
        uploadQuadrimestre
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
