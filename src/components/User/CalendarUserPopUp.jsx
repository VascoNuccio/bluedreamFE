import React, { useEffect, useState } from "react";
import popupStyles from '@/assets/styles/popupuser.module.scss';
import Turno from "./Turno";
import { useAuth } from '@/context/AuthContext';
import ConfirmPopUp from "@/components/ConfirmPopUp";

const CalendarUserPopup = ({ day, monthName, turni = [], onCancel, refresh }) => {
  const { cancelEventBooking, bookEvent } = useAuth();
  const [isMessageError, setMessageError] = useState(false);

  const handlePrenota = async (idTurno) => {
    if (!idTurno) return;
    
    try {
      const res = await bookEvent(idTurno);
      refresh();
    } catch (err) {
      setMessageError({message: err.message??"Errore prenotazione:", error: true})
    }
  };

  const handleDisdici = async (idTurno) => {
    if (!idTurno) return;
    
    try {
      const res = await cancelEventBooking(idTurno);
      refresh();
    } catch (err) {
      setMessageError({message: err.message??"Errore disdetta:", error: true})
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

          return (
            <Turno
              key={t.id}
              numero={index + 1}
              titolo={t.title}
              description={t.description}
              attrezzatura={t.equipment}
              ora={t.startTime+" - "+t.endTime}
              partecipanti={Array.isArray(t.partecipanti) ? t.partecipanti : []}
              postiTotali={Number(t.maxSlots) || 0}
              note={t.note}
              isFull={t.signedUpCount >= (Number(t.maxSlots) || 0)}
              minLevel={t.minLevel}
              canBook={t.canBook}
              onPrenota={() => handlePrenota(t.id)}
              onDisdici={() => handleDisdici(t.id)}
            />
          );
        })}

        <div className={popupStyles.popupButtons}>
          <button onClick={onCancel} >Chiudi</button>
        </div>
      </div>
      {isMessageError && <ConfirmPopUp message={isMessageError?.message} onCancel={()=>setMessageError(false)} isError = {isMessageError?.error}/>}
    </div>
  );
};

export default CalendarUserPopup;
