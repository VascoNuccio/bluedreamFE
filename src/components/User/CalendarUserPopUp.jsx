import React, { useEffect, useState } from "react";
import popupStyles from '@/assets/styles/popupuser.module.scss';
import Turno from "./Turno";
import { useAuth } from '@/context/AuthContext';

const CalendarUserPopup = ({ dateKey, day, monthName, turni = [], onCancel, setTurniForDate }) => {
  const { user, cancelEventBooking, bookEvent } = useAuth();
  const [isOpen, setOpen] = useState(false);
  const email = user?.email;

  const handlePrenota = async (idTurno) => {
    if (!idTurno) return;
    
    try {
      const res = await bookEvent(idTurno); // { success, turno, turni }
      console.log("risposta: ",res)
      // aggiornamento lato FE con i turni ritornati dal BE (migliore coerenza)
      setTurniForDate(res.turni || turni);
    } catch (err) {
      console.error("Errore prenotazione:", err);
    } finally {
      setOpen(false);
    }

    setOpen(true);
  };

  const handleDisdici = async (index) => {
    if (!email) return;
    
    try {
      const res = await cancelEventBooking(email, dateKey, index); // { success, turno, turni }
      console.log("risposta: ",res)
      setTurniForDate(res.turni || turni);
    } catch (err) {
      console.error("Errore disdetta:", err);
    } finally {
      setOpen(false);
    }

    setOpen(true);
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
          const partecipanti = Array.isArray(t.partecipanti) ? t.partecipanti : [];
          const total = Number(t.maxSlots) || 0;
          const isFull = t.signedUpCount >= total;

          return (
            <Turno
              key={t.id}
              numero={index + 1}
              titolo={t.title}
              description={t.description}
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
          <button onClick={onCancel} disabled={isOpen}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarUserPopup;
