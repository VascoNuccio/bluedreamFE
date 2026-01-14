/**
 * useAuthFetch.js
 * - Gestione fetch protette con access token in memoria
 * - Refresh automatico se access token scaduto
 * - Logout automatico se refresh fallisce
 */

import { useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function useAuthFetch({ setUser }) {
  const accessTokenRef = useRef(null); // access token in memoria

  /**
   * Aggiorna l'access token dopo login o refresh
   */
  const setAccessToken = (token) => {
    accessTokenRef.current = token;
  };

  /**
   * Effettua il logout:
   * - Chiama l’API /logout
   * - Cancella i cookie lato server
   * - Reset dello user lato client
   */
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });

      // Aggiorna access token in memoria
      setAccessToken(null);
      // Aggiorna user se presente
      setUser(null);

    } catch (err) {
      console.error("Errore logout:", err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Effettua una fetch protetta.
   * - Se 401 → prova il refresh token
   * - Se refresh fallisce → logout
   */
  const doFetch = async (path, options = {}, retry = false) => {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

    const headers = { ...(options.headers || {}) };
    
    // Solo se NON sto inviando FormData, imposto JSON
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (accessTokenRef.current) headers.Authorization = `Bearer ${accessTokenRef.current}`;

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // invia cookie refreshToken
    });

    // ACCESS TOKEN SCADUTO
    if (res.status === 401 && !retry) {
      const refreshed = await tryRefresh();
      if (!refreshed) {
        logout();
        throw new Error("Sessione scaduta. Accedi di nuovo.");
      }
      return doFetch(path, options, true); // riprova
    }

    // Determina tipo di risposta
    const contentType = res.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Errore API");
      return data;
    } else {
      // se non JSON, ritorna il blob
      const blob = await res.blob();
      if (!res.ok) throw new Error("Errore API (non JSON)");
      return blob;
    }
  };

  /**
   * Prova a fare refresh del token
   */
  const tryRefresh = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // invia cookie HttpOnly
      });

      if (!res.ok) return false;

      const data = await res.json();

      // Aggiorna access token in memoria
      if (data.token) setAccessToken(data.token);

      // Aggiorna user se presente
      if (data.user) setUser(data.user);

      return true;
    } catch {
      return false;
    }
  };

  /**
   * Wrapper principale per fetch
   */
  const authFetch = (path, options = {}) => doFetch(path, options);

  return {
    authFetch,
    setAccessToken, // utile dopo login / signin
    logout
  };
}
