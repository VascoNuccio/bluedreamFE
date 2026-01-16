import React, { useEffect, useState } from "react";
import styles from "@/assets/styles/gestoreTurniAdminFull.module.scss";
import ConfirmPopup from "@/components/ConfirmPopUp";
import { useAuth } from '@/context/AuthContext';
import Dropdown from "@/components/Dropdown";

const CardAddEventAdmin = ({ addTurno, dateTurno }) => {
  const { saveNuovoTurno } = useAuth();

  const [newTurno, setNewTurno] = useState({
    nomeAllenamento: "",
    ora: "",
    postiTotali: "",
    note: "",
    date: dateTurno,


    title: "",
    description: "",
    equipment: "",
    location: "",
    // date: "2025-12-23",
    startTime: "",
    endTime: "",
    maxSlots: "0",
    categoryId: 0

  });

  const [confirmData, setConfirmData] = useState(null);

  const isErrorMessage = (newTurno) => {

    let messageObj = {error: false, message: ""};

    if(!newTurno) return {error: true, message: "Campo obbligatorio"};

    if(!newTurno.title || newTurno.title.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Titolo obbligatorio"};
    }

    if(!newTurno.description || newTurno.description.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Descrizione obbligatoria"};
    }

    if(!newTurno.equipment || newTurno.equipment.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Attrezzatura obbligatoria"};
    }

    if(!newTurno.location || newTurno.location.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Posto obbligatorio"};
    }

    if(!newTurno.date || newTurno.date.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Data obbligatoria"};
    }

    if(newTurno.date) { 
      function isValidDate(dateStr) {
        // formato YYYY-MM-DD
        const dataRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!dataRegex.test(dateStr)) return false;

        const [year, month, day] = dateStr.split('-').map(Number);

        const date = new Date(year, month - 1, day);

        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      }

      if(!isValidDate(newTurno.date)) {
        let mess = messageObj.message? messageObj.message+", " : "";
        messageObj = {error: true, message: mess+"Data non valida"};
      }
    }

    if(!newTurno.startTime || newTurno.startTime.trim() === "" || !newTurno.endTime || newTurno.endTime.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Orario obbligatorio"};
    }

    if(newTurno.startTime && newTurno.endTime) {
      const oraRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 
      if(!oraRegex.test(newTurno.startTime) || !oraRegex.test(newTurno.endTime)) {
        let mess = messageObj.message? messageObj.message+", " : "";
        messageObj = {error: true, message: mess+"Formato ora non valido (HH:MM)"};
      }
    }

    if(!newTurno.maxSlots || newTurno.maxSlots.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Posti totali obbligatori"};
    }

    if(newTurno.maxSlots && (isNaN(newTurno.maxSlots) || newTurno.maxSlots < 1)) {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Deve essere un numero maggiore di 0"};
    }

    return messageObj;;
  }

  const handleChange = (k, v) => {
    setNewTurno({ ...newTurno, [k]: v });
  };

  const handleAdd = () => {
    const messageObj = isErrorMessage(newTurno);
    if (messageObj.error) {
      setConfirmData({ message: messageObj.message, error: true });
      return;
    }

    setConfirmData({ message: "Confermi l'aggiunta del nuovo turno?", error: false });
  };

  const confirmAddNewTurno = () => {
    // save db nuovo turno
    saveNuovoTurno(newTurno).then((data) => {
      addTurno(data.turni);
      setNewTurno({
        nomeAllenamento: "",
        ora: "",
        postiTotali: "",
        note: "",
        date: dateTurno
      });
      setConfirmData(null);
    }).catch((err) => {
      setConfirmData({ message: "Errore: turno non salvato", error: true });
    });
  };

  const cancelConfirm = () => setConfirmData(null); 

  return (
    <div className={styles.addSection}>
      <h3>Aggiungi nuovo turno</h3>

      <Dropdown isEditing={false} isVisible={true} placeholder={"Nome allenamento"} fields={allenamentiDropdown} isPlaceholderBlue={true} text={newTurno.nomeAllenamento} onChange={(value) => handleChange("nomeAllenamento", value)}/>

      <input
        placeholder="Ora"
        value={newTurno.ora}
        onChange={(e) => handleChange("ora", e.target.value)}
      />

      <input
        placeholder="Posti Totali"
        value={newTurno.postiTotali}
        onChange={(e) => handleChange("postiTotali", e.target.value)}
      />

      <input
        placeholder="Note aggiuntive"
        value={newTurno.note}
        onChange={(e) => handleChange("note", e.target.value)}
      />

      <section className={styles.addButtonSection}>
        <button onClick={handleAdd}>Aggiungi</button>
      </section>

      {/* POPUP CONFERMA */}
      {confirmData && (
        <ConfirmPopup
          isError={confirmData.error}
          message={confirmData.message}
          onConfirm={confirmAddNewTurno}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  );
};

export default CardAddEventAdmin;
