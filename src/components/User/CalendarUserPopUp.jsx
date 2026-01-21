import React, { useEffect, useState } from "react";
import popupStyles from '@/assets/styles/popupuser.module.scss';
import Turno from "./Turno";
import { useAuth } from '@/context/AuthContext';

const CalendarUserPopup = ({ dateKey, day, monthName, turni = [], onCancel, setTurniForDate }) => {
  const { user, prenotaTurno, disdiciTurno } = useAuth();
  const [loading, setLoading] = useState(false);
  const email = user?.email;

  const handlePrenota = async (index) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await prenotaTurno(email, dateKey, index); // { success, turno, turni }
      // aggiornamento lato FE con i turni ritornati dal BE (migliore coerenza)
      setTurniForDate(res.turni || turni);
    } catch (err) {
      console.error("Errore prenotazione:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisdici = async (index) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await disdiciTurno(email, dateKey, index); // { success, turno, turni }
      setTurniForDate(res.turni || turni);
    } catch (err) {
      console.error("Errore disdetta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={popupStyles.popupOverlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={popupStyles.popup}>
        <h3>{day} {monthName}</h3>

        {turni.length === 0 && <p>Nessun turno disponibile.</p>}

        {[...turni]
        .sort((a, b) => {
          // startTime formato "HH:mm"
          return a.startTime.localeCompare(b.startTime);
        })
        .map((t, index) => {
          console.log("Turno:", t);
          const partecipanti = Array.isArray(t.partecipanti) ? t.partecipanti : [];
          const total = Number(t.maxSlots) || 0;
          const isFull = t.signedUpCount >= total;

          return (
            <Turno
              key={t.id}
              numero={index + 1}
              titolo={t.title}
              nomeAllenamento={t.description}
              attrezzatura={t.equipment}
              ora={t.startTime+" - "+t.endTime}
              partecipanti={partecipanti}
              postiTotali={total}
              note={t.note}
              isFull={isFull}
              minLevel={t.minLevel}
              canBook={t.canBook}
              onPrenota={() => handlePrenota(t.id)}
              onDisdici={() => handleDisdici(t.id)}
            />
          );
        })}

        <div className={popupStyles.popupButtons}>
          <button onClick={onCancel} disabled={loading}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarUserPopup;
