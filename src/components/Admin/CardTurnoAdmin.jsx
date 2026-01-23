import React, { useEffect, useState } from "react";
import styles from "@/assets/styles/cardTurnoAdmin.module.scss";
import IconEdit from "@/assets/modifica.svg";
import ConfirmPopup from "@/components/ConfirmPopUp";
import PartecipantiDropdownMenu from "@/components/PartecipantiDropdownMenu";

// MAIN COMPONENT
const CardTurnoAdmin = ({ index, turno, saveEdit, removeTurno, restoreTurno, removeTurnoHard }) => {

  const [editData, setEditData] = useState({ ...turno });
  const [editingField, setEditingField] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const isDisabled = turno.status !== 'SCHEDULED'

  const startFieldEdit = (field) => {
    setEditingField(field);
  };

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

    if(!newTurno.maxSlots || newTurno.maxSlots.trim() === "") {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Posti totali obbligatori"};
    }

    if(newTurno.maxSlots && (isNaN(newTurno.maxSlots) || newTurno.maxSlots < 1)) {
      let mess = messageObj.message? messageObj.message+", " : "";
      messageObj = {error: true, message: mess+"Deve essere un numero maggiore di 0"};
    }

    return messageObj;;
  };

  const requestConfirm = (action, field = null, messageText = null) => {
    let message = null;
    let messageObj = {error: false, message: ""};

    if(action === "remove" || action === "removeHard"){
      message = "Confermi la rimozione?";
    }else if(action === "ripristina"){
      message = "Confermi il ripristino?";
    }else if(action === "save"){
      message = "Confermi il salvataggio?";
      if (messageText) message = messageText;
      messageObj = isErrorMessage(field);
      if (messageObj.error) {
        message = messageObj.message;
      }
    }
    
    setConfirmData({ message, action, field, error: messageObj.error });
  };

  const handleConfirm = () => {
    if (!confirmData) return;

    if (confirmData.action === "save"){
      saveField(confirmData.field, editData[confirmData.field]);
    } 
    if (confirmData.action === "ripristina"){
      restoreTurno();
    }
    if (confirmData.action === "remove"){
      removeTurno();
    } 
    if (confirmData.action === "removeHard"){
      removeTurnoHard();
    } 

    setConfirmData(null);
  };

  const handleCancelConfirm = () => {
    setConfirmData(null);
  };

  const saveField = (field, value) => {
    saveEdit(field, value);
    setEditingField(null);
  };

  const cancelField = () => {
    setEditData({ ...turno });
    setEditingField(null);
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.turnoCard}>

      {/* TITOLO */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "title" || isDisabled}
          value={editData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Titolo"
        />
        {editingField === "title" && !isDisabled ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "title")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("title")} />
        )}
      </div>

      {/* DESCRIZIONE */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "description" || isDisabled}
          value={editData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descrizione"
        />
        {editingField === "description" && !isDisabled ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "description")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("description")} />
        )}
      </div>

      {/* ATTREZZATURA */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "equipment" || isDisabled}
          value={editData.equipment}
          onChange={(e) => handleChange("equipment", e.target.value)}
          placeholder="Attrezzatura"
        />
        {editingField === "equipment" && !isDisabled ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "equipment")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("equipment")} />
        )}
      </div>

      {/* LUOGO */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "location" || isDisabled}
          value={editData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Luogo"
        />
        {editingField === "location" && !isDisabled ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "location")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("location")} />
        )}
      </div>

      {/* ORA INIZIO */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "startTime" || isDisabled}
          value={editData.startTime}
          onChange={(e) => handleChange("startTime", e.target.value)}
          placeholder="Orario inizio"
        />
        {editingField === "startTime" && !isDisabled? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "startTime")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("startTime")} />
        )}
      </div>

      {/* ORA FINE */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "endTime" || isDisabled}
          value={editData.endTime}
          onChange={(e) => handleChange("endTime", e.target.value)}
          placeholder="Orario fine"
        />
        {editingField === "endTime" && !isDisabled? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "endTime")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("endTime")} />
        )}
      </div>

      {/* POSTI TOTALI */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "maxSlots" || isDisabled}
          value={editData.maxSlots}
          onChange={(e) => handleChange("maxSlots", e.target.value)}
          placeholder="Posti totali"
        />
        {editingField === "maxSlots" && !isDisabled? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "maxSlots")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("maxSlots")} />
        )}
      </div>

      {/* NOTE */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "note" || isDisabled}
          value={editData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Note aggiuntive"
        />
        {editingField === "note" && !isDisabled? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "note")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("note")} />
        )}
      </div>

      {/* PARTECIPANTI  */}
      <PartecipantiDropdownMenu
        isDisabled={!isDisabled}
        key={turno.id}
        turno={turno}
        placeholder="Partecipanti"
        onChange={(updated) => handleChange("partecipanti", updated)}
      />

      {/* RIMUOVI - RIPRISTINA */}
      <div className={styles.actions}>
        {isDisabled && <button onClick={() => requestConfirm("ripristina")} className={styles.ripristinaBtn}>Ripristina</button> }
        <button onClick={() => requestConfirm(isDisabled?"removeHard":"remove")} className={styles.removeBtn}>Rimuovi</button>
      </div>

      {/* POPUP */}
      {confirmData && (
        <ConfirmPopup
          isError={confirmData.error}
          message={confirmData.message}
          onConfirm={()=>handleConfirm(index)}
          onCancel={handleCancelConfirm}
        />
      )}

    </div>
  );
};

export default CardTurnoAdmin;