import React, { useState, useEffect, useMemo } from "react";
import styles from '@/assets/styles/calendar.module.scss';
import { useAuth } from '@/context/AuthContext';
import CalendarUserPopup from "./CalendarUserPopUp";

const pad2 = (n) => String(n).padStart(2, "0");
const makeKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const Calendar = () => {
  const { user, getCalendarEvents, getDayEvents } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [turni, setTurni] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const changeMonth = (offset) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setSelectedDay(null);
    setCurrentDate(newDate);
  };

  const prevMonth = () => { changeMonth(-1); setRefresh(!refresh); };
  const nextMonth = () => { changeMonth(1); setRefresh(!refresh); };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthForApi = month + 1;
  const monthName = currentDate.toLocaleString("it-IT", { month: "long" });

  const today = new Date();
  const todayKey = makeKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  /* =========================
     CARICAMENTO EVENTI MESE
  ========================= */
  useEffect(() => {
    if (!user?.email) return;
    let active = true;

    const load = async () => {
      try {
        const data = await getCalendarEvents(year, monthForApi);
        if (!active) return;

        const rawEvents = data.events || [];
        const normalized = {};

        rawEvents.forEach(ev => {
          const date = new Date(ev.date);
          const key = makeKey(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          );

          if (!normalized[key]) normalized[key] = [];

          normalized[key].push({
            ...ev,
            partecipanti: ev.signups?.map(s => s.user?.email).filter(Boolean) || []
          });
        });

        setTurni(normalized);
      } catch (err) {
        console.error("Errore caricamento eventi mese:", err);
      }
    };

    load();
    return () => { active = false; };
  }, [user, year, monthForApi, getCalendarEvents, refresh]);

  /* =========================
     COLONNE ATTIVE
  ========================= */
  const activeWeekdays = useMemo(() => {
    const used = Array(7).fill(false);

    Object.keys(turni).forEach(dateStr => {
      const [y, m, d] = dateStr.split("-").map(Number);
      if (y === year && m === monthForApi && turni[dateStr]?.length) {
        const weekday = new Date(y, m - 1, d).getDay();
        const idx = weekday === 0 ? 6 : weekday - 1;
        used[idx] = true;
      }
    });

    return used.every(v => !v) ? used : used;
  }, [turni, year, monthForApi]);

  const activeColumnsCount = activeWeekdays.filter(Boolean).length || 1;

  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  /* CELLE VUOTE */
  for (let i = 0; i < adjustedFirst; i++) {
    if (activeWeekdays[i]) {
      cells.push(<div key={`empty-${i}`} className={styles.dayEmpty}></div>);
    }
  }

  /* =========================
     GIORNI DEL MESE
  ========================= */
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = makeKey(year, monthForApi, d);
    const weekday = new Date(year, month, d).getDay();
    const idx = weekday === 0 ? 6 : weekday - 1;

    if (!activeWeekdays[idx]) continue;

    const dayTurni = turni[dateKey] || [];
    const hasEvent = dayTurni.length > 0;

    const userBooked = hasEvent
      ? dayTurni.some(t => t.partecipanti?.includes(user.email))
      : false;

    let dayClass = styles.day;
    if (!hasEvent) dayClass += ` ${styles.dayDisabled}`;
    else if (userBooked) dayClass += ` ${styles.dayBooked}`;
    else dayClass += ` ${styles.dayAvailable}`;

    if (selectedDay === d) dayClass += ` ${styles.selected}`;
    if (dateKey === todayKey) dayClass += ` ${styles.today}`;

    const handleClick = async () => {
      try {
        const data = await getDayEvents(year, pad2(monthForApi), pad2(d));
        const normalizedDay = {};

        (data.events || []).forEach(ev => {
          const date = new Date(ev.date);
          const key = makeKey(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          );

          if (!normalizedDay[key]) normalizedDay[key] = [];
          normalizedDay[key].push({
            ...ev,
            partecipanti: ev.signups?.map(s => s.user?.email) || []
          });
        });

        setTurni(prev => ({ ...prev, ...normalizedDay }));
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

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth}>←</button>
        <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
        <button onClick={nextMonth}>→</button>
      </div>

      <div className={styles.weekdays} style={{ gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)` }}>
        {["Lun","Mar","Mer","Gio","Ven","Sab","Dom"].map((label,i) =>
          activeWeekdays[i] ? <div key={label}>{label}</div> : null
        )}
      </div>

      <div className={styles.calendarGrid} style={{ gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)` }}>
        {cells}
      </div>

      {popupOpen && (
        <CalendarUserPopup
          day={selectedDay}
          monthName={monthName}
          dateKey={makeKey(year, monthForApi, selectedDay)}
          turni={turni[makeKey(year, monthForApi, selectedDay)] || []}
          onCancel={() => { setSelectedDay(null); setPopupOpen(false); }}
          setTurniForDate={(newTurni) =>
            setTurni(prev => ({
              ...prev,
              [makeKey(year, monthForApi, selectedDay)]: newTurni
            }))
          }
        />
      )}
    </div>
  );
};

export default Calendar;
