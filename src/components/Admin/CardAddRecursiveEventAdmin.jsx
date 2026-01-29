import React, { useCallback, useEffect, useState } from "react";
import styles from "@/assets/styles/gestoreTurniAdminFull.module.scss";
import ConfirmPopup from "@/components/ConfirmPopUp";
import { useAuth } from '@/context/AuthContext';
import DropdownList from "@/components/DropdownList";

const CardAddRecursiveEventAdmin = ({ callback }) => {
  const { createRecursiveEvent, getAllAdminEventCategory } = useAuth();

  const [categoryDropdown, setCategoryDropdown] = useState([]);
  const [categorySelected, setCategorySelected] = useState();
  
  const getTodayYYYYMMDD = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };
  
  const [newTurno, setNewTurno] = useState({
    weekday: "", 
    months: "",
    title: "",
    description: "",
    equipment: "",
    location: "",
    date: getTodayYYYYMMDD(),
    startTime: "",
    endTime: "",
    maxSlots: "",
    note: "",
    categoryId: null
  });

  useEffect(() => {
    getAllAdminEventCategory().then((categories) => {
      setCategoryDropdown(categories);

      const trainingAll = categories.find(
        c => c.code === 'TRAINING_ALL'
      );
      setCategorySelected(trainingAll || null);
      setNewTurno(prev => ({ ...prev, categoryId: trainingAll ? trainingAll.id : null }));
    }).catch((err) => {
      console.error("Errore nel caricamento degli allenamenti per il dropdown", err);
    });
  }, [getAllAdminEventCategory]);

  const [confirmData, setConfirmData] = useState(null);

  const isErrorMessage = (newTurno) => {

    let messageObj = {error: false, message: ""};

    if(!newTurno) return {error: true, message: "Campo obbligatorio"};

    let maxMountsNum = Number(newTurno.months);

    if (!/^\d+$/.test(newTurno.months) ||  maxMountsNum <= 0) {
      let mess = messageObj.message ? messageObj.message + ", " : "";
      messageObj = { error: true, message: mess + "ripetizione obbligatoria e maggiore di 0" };
    }

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
      } else {
        // Controllo che startTime non sia dopo endTime
        const [startH, startM] = newTurno.startTime.split(":").map(Number);
        const [endH, endM] = newTurno.endTime.split(":").map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        if(startMinutes > endMinutes) {
          let mess = messageObj.message ? messageObj.message + ", " : "";
          messageObj = { error: true, message: mess + "L'orario di inizio non può essere successivo a quello di fine" };
        }
      }
    }

    let maxSlotsNum = Number(newTurno.maxSlots);

    if (!/^\d+$/.test(newTurno.maxSlots) ||  maxSlotsNum <= 0) {
      let mess = messageObj.message ? messageObj.message + ", " : "";
      messageObj = { error: true, message: mess + "Posti totali obbligatori e maggiori di 0" };
    }

    return messageObj;;
  }

  const handleChange = (k, v) => {
    setNewTurno({ ...newTurno, [k]: v });
  };

  const handleChangeCategory = (value) => {
    handleChange("categoryId", value.id);
    setCategorySelected(value);
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
    setConfirmData({
      message: "Turni creati con successo",
      error: false,
      isFinish: true
    });

    // save db nuovo turno
    createRecursiveEvent(newTurno).then((data) => {
      setNewTurno({
        weekday: "",
        months: "",
        title: "",
        description: "",
        equipment: "",
        location: "",
        date: getTodayYYYYMMDD(),
        startTime: "",
        endTime: "",
        maxSlots: "",
        note: "",
        categoryId: categorySelected ? categorySelected.id : null
      });
    }).catch((err) => {
      console.log("sono dentro error: ",err)
      setConfirmData({ message: err.message||"Errore: turno non salvato", error: true });
    });
  };

  const cancelConfirm = () => {
    if(confirmData.isFinish) callback();
    setConfirmData(null);
  } 

  return (
    <div className={styles.addSection}>

      <DropdownList
        isEditing={true} 
        isVisible={false} 
        placeholder={"Giorno dell'allenamento"} 
        fields={["LUNEDI", "MARTEDI", "MERCOLEDI", "GIOVEDI", "VENERDI", "SABATO", "DOMENICA"]}
        text={newTurno.weekday} 
        onChange={(value) => handleChange("weekday", value)}
      />

      <input
        placeholder="Numero mesi da popolare"
        value={newTurno.months}
        onChange={(e) => handleChange("months", e.target.value)}
      />
      
      <input
        placeholder="Titolo"
        value={newTurno.title}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      <input
        placeholder="Descrizione"
        value={newTurno.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <input
        placeholder="Attrezzatura"
        value={newTurno.equipment}
        onChange={(e) => handleChange("equipment", e.target.value)}
      />

      <input
        placeholder="Luogo"
        value={newTurno.location}
        onChange={(e) => handleChange("location", e.target.value)}
      />

      <input
        placeholder="Giorno"
        disabled
        value={newTurno.date}
        onChange={(e) => handleChange("date", e.target.value)}
      />

      <input
        placeholder="Ora inizio"
        value={newTurno.startTime}
        onChange={(e) => handleChange("startTime", e.target.value)}
      />

      <input
        placeholder="Ora fine"
        value={newTurno.endTime}
        onChange={(e) => handleChange("endTime", e.target.value)}
      />

      <input
        placeholder="Posti Totali"
        value={newTurno.maxSlots}
        onChange={(e) => handleChange("maxSlots", e.target.value)}
      />

      <input
        placeholder="Note aggiuntive"
        value={newTurno.note}
        onChange={(e) => handleChange("note", e.target.value)}
      />

      <DropdownList
        isEditing={true} 
        isVisible={false} 
        placeholder={"Categoria evento"} 
        fields={categoryDropdown}
        text={categorySelected ? categorySelected.code : ""}
        valueKey="code"
        onChange={(value) => handleChangeCategory(value)}
      />

      <section className={styles.addButtonSection}>
        <button onClick={handleAdd}>Aggiungi</button>
      </section>

      {/* POPUP CONFERMA */}
      {confirmData && (
        <ConfirmPopup
          isError={confirmData.error}
          message={confirmData.message}
          onConfirm={confirmData.isFinish?cancelConfirm:confirmAddNewTurno}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  );
};

export default CardAddRecursiveEventAdmin;
