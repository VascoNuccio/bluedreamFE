import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "@/assets/styles/calendar.module.scss";
import { useAuth } from "@/context/AuthContext";
import CalendarUserPopup from "./CalendarUserPopUp";

const pad2 = (n) => String(n).padStart(2, "0");
const makeKey = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const Calendar = () => {
  const { user, getCalendarEvents, getDayEvents } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const [monthTurni, setMonthTurni] = useState({});
  const [dayTurni, setDayTurni] = useState([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthForApi = month + 1;
  const monthName = currentDate.toLocaleString("it-IT", { month: "long" });

  const today = new Date();
  const todayKey = makeKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  /* =========================
     CAMBIO MESE
  ========================= */
  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
    setSelectedDay(null);
    setPopupOpen(false);
    setDayTurni([]);
  };

  /* =========================
     CARICAMENTO EVENTI MESE
  ========================= */
  const loadMonthEvents = useCallback(async () => {
    if (!user?.email) return;

    try {
      const data = await getCalendarEvents(year, monthForApi);
      const normalized = {};

      (data.events || []).forEach((ev) => {
        const date = new Date(ev.date);
        const key = makeKey(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        );

        if (!normalized[key]) normalized[key] = [];

        normalized[key].push({
          ...ev,
          partecipanti:
            ev.signups?.map((s) => s.user?.email).filter(Boolean) || []
        });
      });

      setMonthTurni(normalized);
    } catch (err) {
      console.error("Errore caricamento eventi mese:", err);
    }
  }, [user, year, monthForApi, getCalendarEvents]);

  useEffect(() => {
    loadMonthEvents();
  }, [loadMonthEvents, refreshKey]);

  /* =========================
     CARICAMENTO EVENTI GIORNO
  ========================= */
  const loadDayEvents = useCallback(
    async (day) => {
      if (!day) return;

      try {
        const data = await getDayEvents(
          year,
          pad2(monthForApi),
          pad2(day)
        );

        const normalized = (data.events || []).map((ev) => ({
          ...ev,
          partecipanti:
            ev.signups?.map((s) => s.user?.email).filter(Boolean) || [],
          maxSlots: Number(ev.maxSlots) || 0,
          minLevel: ev.minLevel ?? "ALL",
          canBook: !!ev.canBook
        }));

        setDayTurni(normalized);
      } catch (err) {
        console.error("Errore caricamento giorno:", err);
      }
    },
    [year, monthForApi, getDayEvents]
  );

  /* =========================
     COLONNE ATTIVE (NO FALLBACK)
  ========================= */
  const activeWeekdays = useMemo(() => {
    const used = Array(7).fill(false);

    Object.keys(monthTurni).forEach((dateStr) => {
      const [y, m, d] = dateStr.split("-").map(Number);
      if (y === year && m === monthForApi && monthTurni[dateStr]?.length) {
        const weekday = new Date(y, m - 1, d).getDay();
        const idx = weekday === 0 ? 6 : weekday - 1;
        used[idx] = true;
      }
    });

    return used;
  }, [monthTurni, year, monthForApi]);

  const activeColumnsCount =
    activeWeekdays.filter(Boolean).length || 1;

  /* =========================
     CLICK GIORNO
  ========================= */
  const handleDayClick = async (day) => {
    await loadDayEvents(day);
    setSelectedDay(day);
    setPopupOpen(true);
  };

  /* =========================
     COSTRUZIONE CALENDARIO
  ========================= */
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  // celle vuote iniziali
  for (let i = 0; i < adjustedFirst; i++) {
    if (activeWeekdays[i]) {
      cells.push(
        <div key={`empty-${i}`} className={styles.dayEmpty} />
      );
    }
  }

  // giorni del mese
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = makeKey(year, monthForApi, d);
    const weekday = new Date(year, month, d).getDay();
    const idx = weekday === 0 ? 6 : weekday - 1;

    if (!activeWeekdays[idx]) continue;

    const dayEvents = monthTurni[dateKey] || [];
    const hasEvent = dayEvents.length > 0;

    const userBooked = hasEvent
      ? dayEvents.some((t) =>
          t.partecipanti?.includes(user?.email)
        )
      : false;

    let dayClass = styles.day;
    if (!hasEvent) dayClass += ` ${styles.dayDisabled}`;
    else if (userBooked) dayClass += ` ${styles.dayBooked}`;
    else dayClass += ` ${styles.dayAvailable}`;

    if (selectedDay === d) dayClass += ` ${styles.selected}`;
    if (dateKey === todayKey) dayClass += ` ${styles.today}`;

    cells.push(
      <div
        key={d}
        className={dayClass}
        onClick={() => handleDayClick(d)}
      >
        <span>{d}</span>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button onClick={() => changeMonth(-1)}>←</button>
        <h2>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}{" "}
          {year}
        </h2>
        <button onClick={() => changeMonth(1)}>→</button>
      </div>

      <div
        className={styles.weekdays}
        style={{
          gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)`
        }}
      >
        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(
          (label, i) =>
            activeWeekdays[i] ? <div key={label}>{label}</div> : null
        )}
      </div>

      <div
        className={styles.calendarGrid}
        style={{
          gridTemplateColumns: `repeat(${activeColumnsCount}, 1fr)`
        }}
      >
        {cells}
      </div>

      {popupOpen && (
        <CalendarUserPopup
          day={selectedDay}
          monthName={monthName}
          turni={dayTurni}
          onCancel={() => {
            setPopupOpen(false);
            setSelectedDay(null);
            setDayTurni([]);
          }}
          refresh={async () => {
            setRefreshKey((k) => k + 1);
            await loadDayEvents(selectedDay);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
