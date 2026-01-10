import React, { useState } from "react";
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

        {turni.map((t, index) => {
          const partecipanti = Array.isArray(t.partecipanti) ? t.partecipanti : [];
          const total = Number(t.postiTotali) || 0;
          const isFull = partecipanti.length >= total;

          return (
            <Turno
              key={t.id || `${t.ora}-${index}`}
              numero={t.numero ?? index + 1}
              nomeAllenamento={t.nomeAllenamento}
              attrezzatura={t.attrezzatura}
              ora={t.ora}
              partecipanti={partecipanti}
              postiTotali={total}
              note={t.note}
              isFull={isFull}
              onPrenota={() => handlePrenota(index)}
              onDisdici={() => handleDisdici(index)}
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
