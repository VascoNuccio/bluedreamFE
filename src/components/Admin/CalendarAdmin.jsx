import React, { useState, useEffect } from "react";
import styles from '@/assets/styles/calendar.module.scss';
import { useAuth } from '@/context/AuthContext';
import GestoreTurniAdmin from "./GestoreTurniAdmin";

const pad2 = (n) => String(n).padStart(2, '0');
const makeDateKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const CalendarAdmin = () => {
  const { user, getCalendarEvents, getDayEvents } = useAuth();

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
  const prevMonth = () =>{changeMonth(-1); setRefresh(!refresh)};
  const nextMonth = () =>{changeMonth(1); setRefresh(!refresh)};

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthForApi = month + 1;
  const monthName = currentDate.toLocaleString("it-IT", { month: "long" });
  const [data, setData] = useState({})

  useEffect(()=>{
    setData(getCalendarEvents(year, monthForApi));
  },[refresh])

  /** CARICO I TURNI E NORMALIZZO LE CHIAVI */
  useEffect(() => {
    if (!user?.email) return;

    let active = true;

    const load = async () => {
      try {

        if (!active) return;

        const rawTurni = data.turni || {};
        const normalized = {};

        Object.keys(rawTurni).forEach(k => {
          const [y, m, d] = k.split("-").map(Number);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const nk = makeDateKey(y, m, d);
            normalized[nk] = rawTurni[k];
          }
        });

        setTurni(normalized);
      } catch (err) {
        console.error("Errore caricamento eventi mese:", err);
      }
    };

    load();
    return () => { active = false };
  }, [user, year, monthForApi, getCalendarEvents, refresh]);

  /** CALENDARIO */
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
    const userBooked = hasEvent ? dayTurni.some(t => t.partecipanti?.includes(user.email)) : false;

    let dayClass = styles.day;

    // Stessi colori che avevi
    if (!hasEvent) dayClass += ` ${styles.dayDisabledAdmin}`;
    else if (userBooked) dayClass += ` ${styles.dayBooked}`;
    else dayClass += ` ${styles.dayAvailable}`;

    if (selectedDay === d) dayClass += ` ${styles.selected}`;
    if (dateKey === todayKey) dayClass += ` ${styles.today}`; // BORDO GIALLO

    /** ORA OGNI GIORNO È CLICCABILE */
    const handleClick = async () => {
      try {
        const data = await getDayEvents(year, pad2(monthForApi), pad2(d));
        setTurni(prev => ({
          ...prev,
          [dateKey]: data.turni || []
        }));
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

  /** Callback da GestoreTurniAdmin (SALVATAGGIO REALTIME) */
  const setTurniForDate = (newTurni) => {
    if (!selectedDay) return;
    const dateKey = makeDateKey(year, monthForApi, selectedDay);

    setTurni(prev => ({
      ...prev,
      [dateKey]: newTurni || []
    }));
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

      {popupOpen && (
        <GestoreTurniAdmin
          day={selectedDay}
          monthName={monthName}
          dateKey={makeDateKey(year, monthForApi, selectedDay)}
          turni={turni[makeDateKey(year, monthForApi, selectedDay)] || []}
          onCancel={() => { setSelectedDay(null); setPopupOpen(false); setRefresh(!refresh);}}
          setTurniForDate={setTurniForDate}
        />
      )}
    </>
  );
};

export default CalendarAdmin;
