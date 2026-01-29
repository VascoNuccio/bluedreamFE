import React, { useState, useEffect } from "react";
import styles from '@/assets/styles/calendar.module.scss';
import { useAuth } from '@/context/AuthContext';
import GestoreTurniAdmin from "./GestoreTurniAdmin";
import Collapse from "@/components/Collapse";
import CardAddRecursiveEventAdmin from "@/components/Admin/CardAddRecursiveEventAdmin";

const pad2 = (n) => String(n).padStart(2, '0');
const makeDateKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const CalendarAdmin = () => {
  const { user, getAdminCalendarEvents, getAdminDayEvents } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [turni, setTurni] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const today = new Date();
  const todayKey = makeDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setSelectedDay(null);
    setCurrentDate(newDate);
  };
  const prevMonth = () => { changeMonth(-1); setRefresh(!refresh) };
  const nextMonth = () => { changeMonth(1); setRefresh(!refresh) };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthForApi = month + 1;
  const monthName = currentDate.toLocaleString("it-IT", { month: "long" });

  // =========================
  // NORMALIZZAZIONE TURNI (CHIAVI YYYY-MM-DD)
  // =========================
  useEffect(() => {
    if (!user?.email) return;

    let active = true;

    const load = async () => {
      try {
        //carico gli eventi del mese
        const data = await getAdminCalendarEvents(year, monthForApi); // <-- aspetta qui
        if (!active) return;

        // rawEvents è ora un array di eventi
        const rawEvents = data.events || [];
        const normalized = {};

        rawEvents.forEach(ev => {
          const date = new Date(ev.date);
          const y = date.getFullYear();
          const m = date.getMonth() + 1; // mesi 0-11
          const d = date.getDate();
          const key = makeDateKey(y, m, d);

          if (!normalized[key]) normalized[key] = [];

          // aggiungiamo i partecipanti (email degli utenti iscritti)
          normalized[key].push({
            ...ev,
            partecipanti: ev.signups?.map(s => s.user?.email).filter(Boolean) || []
          });
        });

        // assicurati che tutte le chiavi siano array (previene errori map)
        Object.keys(normalized).forEach(k => {
          normalized[k] = Array.isArray(normalized[k]) ? normalized[k] : [normalized[k]];
        });


        setTurni(normalized);

      } catch (err) {
        console.error("Errore caricamento eventi mese:", err);
      }
    };

    load();
    return () => { active = false };
  }, [user, year, monthForApi, getAdminCalendarEvents, refresh]);

  // =========================
  // CALENDARIO
  // =========================
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  /** CELLE VUOTE */
  for (let i = 0; i < adjustedFirst; i++) {
    cells.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
  }

  /** GIORNI DEL MESE */
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = makeDateKey(year, monthForApi, d);
    const dayTurni = turni[dateKey] || [];
    const hasEvent = dayTurni.length > 0;

    // verifico se l'utente è iscritto a qualche evento in questo giorno
    const userBooked = hasEvent ? dayTurni.some(t => t.partecipanti?.includes(user.email)) : false;

    let dayClass = styles.day;

    if (!hasEvent) dayClass += ` ${styles.dayDisabledAdmin}`;
    else if (userBooked) dayClass += ` ${styles.dayBooked}`;
    else dayClass += ` ${styles.dayAvailable}`;

    if (selectedDay === d) dayClass += ` ${styles.selected}`;
    if (dateKey === todayKey) dayClass += ` ${styles.today}`; // BORDO GIALLO

    /** CLICK SU GIORNO - NORMALIZZAZIONE STESSA LOGICA */
    const handleClick = async () => {
      try {
        const data = await getAdminDayEvents(year, pad2(monthForApi), pad2(d));
        const normalizedDay = {};

        (data.events || []).forEach(ev => {
          const date = new Date(ev.date);
          const y = date.getFullYear();
          const m = date.getMonth() + 1;
          const day = date.getDate();
          const key = makeDateKey(y, m, day);

          if (!normalizedDay[key]) normalizedDay[key] = [];
          normalizedDay[key].push({
            ...ev,
            partecipanti: ev.signups?.map(s => s.user?.email) || []
          });
        });

        setTurni(prev => {
          const updated = { ...prev };

          Object.keys(normalizedDay).forEach(key => {
            updated[key] = Array.isArray(normalizedDay[key]) ? normalizedDay[key] : [normalizedDay[key]];
          });
        
          return updated;
        });

      } catch (err) {
        console.error("Errore caricamento giorno:", err);
      }

      setSelectedDay(d);
      setPopupOpen(true);
    };

    cells.push(
      <div key={d} className={dayClass} onClick={handleClick}>
        <span>{d}</span>
      </div>
    );
  }

  // =========================
  // CALLBACK SALVATAGGIO REALTIME DAL POPUP
  // =========================
  const setTurniForDate = (newTurno, options = { replace: false }) => {
    if (!selectedDay) return;

    const dateKey = makeDateKey(year, monthForApi, selectedDay);

    setTurni(prev => {
      const prevTurni = Array.isArray(prev[dateKey]) ? prev[dateKey] : [];

      // AGGIORNAMENTO il backend mi rimanda TUTTI i turni del giorno
      if (options.replace) {
        return {
          ...prev,
          [dateKey]: Array.isArray(newTurno) ? newTurno : [newTurno],
        };
      }

      // AGGIUNTA il backend mi rimanda un singolo turno
      return {
        ...prev,
        [dateKey]: [
          ...prevTurni,
          ...(Array.isArray(newTurno) ? newTurno : [newTurno]),
        ],
      };
    });
  };

  return (
    <>
      {!popupOpen && (
        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <button onClick={prevMonth}>←</button>
            <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
            <button onClick={nextMonth}>→</button>
          </div>

          <div className={styles.weekdays} style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(label => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className={styles.calendarGrid} style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells}
          </div>
        </div>
      )}

      <section className={styles.add_recursive_day}>
        <Collapse title="Aggiungi eventi ricorsivi" style={{width: '100%'}}>
          <CardAddRecursiveEventAdmin callback={()=>setRefresh(!refresh)}/>
        </Collapse>
      </section>

      {popupOpen && (
        <GestoreTurniAdmin
          day={selectedDay}
          monthName={monthName}
          dateKey={makeDateKey(year, monthForApi, selectedDay)}
          turni={Array.isArray(turni[makeDateKey(year, monthForApi, selectedDay)]) ? 
                turni[makeDateKey(year, monthForApi, selectedDay)] : 
                []}
          onCancel={() => { setSelectedDay(null); setPopupOpen(false); setRefresh(!refresh); }}
          setTurniForDate={setTurniForDate}
        />
      )}
    </>
  );
};

export default CalendarAdmin;
