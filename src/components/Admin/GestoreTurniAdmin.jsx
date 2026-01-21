import React, { useEffect, useState } from "react";
import styles from "@/assets/styles/gestoreTurniAdminFull.module.scss";
import { useAuth } from "@/context/AuthContext";
import CardTurnoAdmin from "./CardTurnoAdmin";
import CardAddEventAdmin from "./CardAddEventAdmin";

const GestoreTurniAdmin = ({ dateKey, day, monthName, turni = [], onCancel, setTurniForDate }) => {
  const { user, updateEvent, cancelEvent, restoreEvent, cancelEventHard } = useAuth();
  const email = user?.email;

  const [editingIndex, setEditingIndex] = useState(null);

  const startEdit = (index) => setEditingIndex(index);
  const closeEdit = () => setEditingIndex(null);

  const saveEdit = (index, field, newValue) => {
    const t = turni[index];
    if (!t) return;

    updateEvent(t.id, { [field]: newValue })
      .then(() => {
        // aggiorno localmente SOLO il turno modificato
        const updatedTurni = turni.map((turno, i) =>
          i === index
            ? { ...turno, [field]: newValue }
            : turno
        );

        setTurniForDate(updatedTurni, { replace: true });
        closeEdit();
      })
      .catch(() => {
        console.error("Non è stato possibile modificare il turno");
      });
  };

  const restoreTurno = (id) => {
    if (!id) return; 
    restoreEvent(id)
      .then(() => {
        const updatedTurni = turni.map(t =>
          t.id === id ? { ...t, status: 'SCHEDULED' } : t
        );
        setTurniForDate(updatedTurni, { replace: true });
      })
      .catch(() => {
        console.error("Non è stato possibile ripristinare il turno");
      });
  };


  const removeTurno = (turno) => {
    if (!turno?.id) return;

    cancelEvent(turno.id)
      .then(() => {
        const updatedTurni = turni.filter(t => t.id !== turno.id);
        setTurniForDate(updatedTurni, { replace: true });
      })
      .catch(() => {
        console.error("Non è stato possibile rimuovere il turno");
      });
  };

  const removeTurnoHard = (turno) => {
    if (!turno?.id) return;

    cancelEventHard(turno.id)
      .then(() => {
        const updatedTurni = turni.filter(t => t.id !== turno.id);
        setTurniForDate(updatedTurni, { replace: true });
      })
      .catch(() => {
        console.error("Non è stato possibile rimuovere il turno");
      });
  };

  const addTurno = (turno) => {
    setTurniForDate(turno);
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span>Gestione turni: </span>
          <span>{day} {monthName}</span>
        </h2>
        <button onClick={onCancel}>Chiudi</button>
      </div>

      {/* LISTA TURNI */}
      <div className={styles.turniList}>
        {turni.map((t, index) => (
          <CardTurnoAdmin
            key={t.id}
            turno={t}
            isEditing={editingIndex === index}
            startEdit={() => startEdit(index)}
            saveEdit={(field, value)=>saveEdit(index, field, value)}
            removeTurno={()=>removeTurno(t)}
            restoreTurno={()=>restoreTurno(t.id)}
            removeTurnoHard={()=>removeTurnoHard(t)}
          />
        ))}
      </div>

      {/* AGGIUNGI NUOVO TURNO */}
      <CardAddEventAdmin addTurno={addTurno} dateTurno={dateKey} />
    </div>
  );
};

export default GestoreTurniAdmin;
