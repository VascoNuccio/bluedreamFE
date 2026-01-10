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

  // Hook per fetch protette (gestisce refresh token)
  const {authFetch, setAccessToken, logout} = useAuthFetch({ setUser });

  // --- LOGIN AUTOMATICO AL CARICAMENTO ---
  useEffect(() => {
    const tryAutoLogin = async () => {
      try {
        const res = await authFetch("/api/auth/refresh", { method: "POST" });
        if (res.token) setAccessToken(res.token);
        if (res.user) setUser(res.user);
      } catch {
        // Non loggato, lascia user=null
      }
    };
    tryAutoLogin();
  }, []);

  /**
   * Login dell’utente:
   * - Invia email/password
   * - Il server SCRIVE nei cookie i token
   * - Nel JSON ritorna solo i dati user
   */
  const login = async (email, password) => {
    const res = await authFetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // Salva access token in memoria
    setAccessToken(res.token);

    setUser(res.user);
    return res;
  };

  /**
   * Signup (registrazione):
   * Funziona come login, ma chiama l’endpoint /signin
   */
  const signin = async (email, password) => {
    const res = await authFetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // Salva access token in memoria
    setAccessToken(res.token);

    setUser(res.user);
    return res;
  };

  /**
   * Wrapper per fetch con gestione errori
   */
  const safeFetch = async (path, options = {}) => {
    try {
      return await authFetch(path, options);
    } catch (err) {
      console.error("Errore API:", err);
      throw err;
    }
  };

  // --- API BUSINESS LOGIC (restano uguali) ---

  /*================ USER FUNCTION ================================*/
  const getCalendarEvents = (email, year, month) =>
    safeFetch(`/api/calendar-events?email=${encodeURIComponent(email || '')}&year=${year}&month=${month}`);

  const getTurni = (email, year, month, day) =>
    safeFetch(`/api/calendar/day?email=${encodeURIComponent(email || '')}&year=${year}&month=${month}&day=${day}`);

  const prenotaTurno = (email, dateKey, index) =>
    safeFetch(`/api/calendar/prenota`, {
      method: "POST",
      body: JSON.stringify({ email, dateKey, index }),
    });

  const disdiciTurno = (email, dateKey, index) =>
    safeFetch(`/api/calendar/disdici`, {
      method: "POST",
      body: JSON.stringify({ email, dateKey, index }),
    });

  /*================ ADMIN FUNCTION ================================*/

  const saveNuovoTurno = newTurno =>
    safeFetch(`/api/admin/aggiungi-turno`, {
      method: "POST",
      body: JSON.stringify(newTurno),
    });

  const deleteTurno = (dataKey, ora, nomeAllenamento) =>
    safeFetch(`/api/admin/elimina-turno`, {
      method: "POST",
      body: JSON.stringify({ dataKey, ora, nomeAllenamento }),
    });

  const modificaTurno = (...args) => {
    const [dataKey, nameNewField, valueNewField, ora, nomeAllenamento, postiTotali, partecipanti] = args;
    return safeFetch(`/api/admin/modifica-turno`, {
      method: "POST",
      body: JSON.stringify({ dataKey, nameNewField, valueNewField, ora, nomeAllenamento, postiTotali, partecipanti }),
    });
  };

  const getUsers = () => safeFetch(`/api/admin/users`);

  const savePartecipanteOnTurno = (email, dateKey, turno) =>
    safeFetch(`/api/admin/aggiungi-partecipante`, {
      method: "POST",
      body: JSON.stringify({ email, dateKey, turno }),
    });

  const deletePartecipanteOnTurno = (email, dateKey, turno) =>
    safeFetch(`/api/admin/rimuovi-partecipante`, {
      method: "POST",
      body: JSON.stringify({ email, dateKey, turno }),
    });

  const getAllenamenti = () => safeFetch(`/api/admin/allenamenti`);

  const saveNuovoAllenamento = async (name) => {
    return safeFetch('/api/admin/allenamenti', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signin,
        logout,
        getCalendarEvents,
        getTurni,
        prenotaTurno,
        disdiciTurno,
        saveNuovoTurno,
        deleteTurno,
        modificaTurno,
        getUsers,
        savePartecipanteOnTurno,
        deletePartecipanteOnTurno,
        getAllenamenti,
        saveNuovoAllenamento
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
