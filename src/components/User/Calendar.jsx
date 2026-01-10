import React, { useState, useEffect, useMemo } from "react";
import styles from '@/assets/styles/calendar.module.scss';
import { useAuth } from '@/context/AuthContext';
import CalendarUserPopup from "./CalendarUserPopUp";

const Calendar = () => {
  const { user, getCalendarEvents, getDayEvents } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const [turni, setTurni] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Helper per generare la chiave yyyy-MM-dd con due cifre
  const pad2 = (n) => String(n).padStart(2, "0");
  const makeKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setSelectedDay(null);
    setCurrentDate(newDate);
  };

  const prevMonth = () =>{changeMonth(-1); setRefresh(!refresh)};
  const nextMonth = () =>{changeMonth(1); setRefresh(!refresh)};

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("it-IT", { month: "long" });
  const [data, setData] = useState({})

  useEffect(()=>{
    setData(getCalendarEvents(year, month + 1));
  },[refresh])

  /** CARICO I TURNI DEL MESE */
  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    const load = async () => {
      try {
        if (active) setTurni(data.turni || {});
      } catch (err) {
        console.error("Errore caricamento eventi mese:", err);
      }
    };
    load();
    return () => { active = false };
  }, [user, year, month, getCalendarEvents]);

  /** CALCOLO COLONNE ATTIVE */
  const activeWeekdays = useMemo(() => {
    const used = [false, false, false, false, false, false, false];

    Object.keys(turni).forEach(dateStr => {
      const [y, m, d] = dateStr.split("-").map(Number);
      if (turni[dateStr].length > 0 && y === year && m === month + 1) {
        const weekday = new Date(y, m - 1, d).getDay();
        const idx = weekday === 0 ? 6 : weekday - 1;
        used[idx] = true;
      }
    });

    if (used.every(v => v === false)) return used;
    return used;
  }, [turni, year, month]);

  const activeColumnsCount = activeWeekdays.filter(Boolean).length || 1;

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  const today = new Date();
  const todayKey = makeKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  /** CELLE VUOTE PRIMA DEL GIORNO 1 */
  for (let i = 0; i < adjustedFirst; i++) {
    if (activeWeekdays[i]) {
      cells.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
    }
  }
  
  /** GIORNI DEL MESE */
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = makeKey(year, month + 1, d);
    const weekday = new Date(year, month, d).getDay();
    const idx = weekday === 0 ? 6 : weekday - 1;

    if (!activeWeekdays[idx]) continue;

    const dayTurni = turni[dateKey] || [];
    const hasEvent = dayTurni.length > 0;

    /** VERIFICO SE L'UTENTE È PRENOTATO IN UNO DEI TURNI */
    const userBooked = hasEvent
      ? dayTurni.some(t => t.partecipanti?.includes(user.email))
      : false;

    /** CLASSI COLORI */
    let dayClass = styles.day;

    if (!hasEvent) {
      dayClass += ` ${styles.dayDisabled}`;
    } else if (userBooked) {
      dayClass += ` ${styles.dayBooked}`;      // blu
    } else {
      dayClass += ` ${styles.dayAvailable}`;   // azzurro chiaro
    }

    if (selectedDay === d) {
      dayClass += ` ${styles.selected}`;
    }

    // Contorno giallo sul giorno corrente
    if (dateKey === todayKey) {
      dayClass += ` ${styles.today}`;
    }

    /** CLICK HANDLER */
    const handleClick = async () => {
      // Rendi cliccabile anche i giorni senza eventi
      try {
        const dayData = await getDayEvents(year, pad2(month + 1), pad2(d));
        setTurni(prev => ({ ...prev, [dateKey]: dayData.turni || [] }));
      } catch (err) {
        console.error("Errore caricamento giorno:", err);
        setTurni(prev => ({ ...prev, [dateKey]: prev[dateKey] || [] }));
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

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth}>←</button>
        <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
        <button onClick={nextMonth}>→</button>
      </div>

      <div className={styles.weekdays} style={{ gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)` }}>
        {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map((label,i) => (
          activeWeekdays[i] ? <div key={label}>{label}</div> : null
        ))}
      </div>

      <div className={styles.calendarGrid} style={{ gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)` }}>
        {cells}
      </div>

      {popupOpen &&
        <CalendarUserPopup
          day={selectedDay}
          monthName={monthName}
          dateKey={makeKey(year, month + 1, selectedDay)}
          turni={turni[makeKey(year, month + 1, selectedDay)] || []}
          onCancel={() => { setSelectedDay(null); setPopupOpen(false); }}
          setTurniForDate={(newTurni) =>
            setTurni(prev => ({ ...prev, [makeKey(year, month + 1, selectedDay)]: newTurni }))
          }
        />}
    </div>
  );
};

export default Calendar;
