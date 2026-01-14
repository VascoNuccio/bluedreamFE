import React, { useEffect, useState } from "react";
import styles from "@/assets/styles/gestoreTurniAdminFull.module.scss";
import { useAuth } from "@/context/AuthContext";
import CardTurnoAdmin from "./CardTurnoAdmin";
import CardAddEventAdmin from "./CardAddEventAdmin";

const GestoreTurniAdmin = ({ dateKey, day, monthName, turni = [], onCancel, setTurniForDate }) => {
  const { user, deleteTurno, modificaTurno } = useAuth();
  const email = user?.email;

  const [editingIndex, setEditingIndex] = useState(null);

  const startEdit = (index) => setEditingIndex(index);
  const closeEdit = () => setEditingIndex(null);

  const saveEdit = (index, nameNewField, valueNewField) => {

    // Modifica il turno a db e sincronizza con la risposta
    const t = [...turni][index];
    modificaTurno(dateKey, nameNewField, valueNewField , t.ora, t.nomeAllenamento, t.postiTotali, t.partecipanti)
      .then(data => {
        setTurniForDate(data.turni);
        closeEdit();
      })
      .catch(err => {
        console.error("Non è stato possibile modificare il turno");
      });
  };

  const removeTurno = (field) => {


    // rimuovo turno a db
    deleteTurno(dateKey, field.ora, field.nomeAllenamento)
      .then(data => {
        setTurniForDate(data.turni);
      })
      .catch(err => {
        console.error("Non è stato possibile rimuovere il turno");
      });
  };

  const addTurno = (turni) => {
    setTurniForDate(turni);
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

      {/* LISTA TURNI
      <div className={styles.turniList}>
        {turni.map((t, index) => (
          <CardTurnoAdmin
            key={index}
            date={dateKey}
            turno={t}
            isEditing={editingIndex === index}
            startEdit={() => startEdit(index)}
            saveEdit={(field, value)=>saveEdit(index, field, value)}
            removeTurno={()=>removeTurno(t)}
          />
        ))}
      </div> */}

      {/* AGGIUNGI NUOVO TURNO */}
      <CardAddEventAdmin addTurno={addTurno} dateTurno={dateKey} />
    </div>
  );
};

export default GestoreTurniAdmin;
