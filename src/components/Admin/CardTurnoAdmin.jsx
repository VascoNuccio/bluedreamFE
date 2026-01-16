import React, { useEffect, useState } from "react";
import styles from "@/assets/styles/cardTurnoAdmin.module.scss";
import IconEdit from "@/assets/modifica.svg";
import ConfirmPopup from "@/components/ConfirmPopUp";
import PartecipantiDropdownMenu from "@/components/PartecipantiDropdownMenu";
import Dropdown from "@/components/Dropdown"

// MAIN COMPONENT
const CardTurnoAdmin = ({ index, date, turno, saveEdit, removeTurno }) => {
  console.log("Rendering CardTurnoAdmin for turno:", turno);

  const [editData, setEditData] = useState({ ...turno });
  const [editingField, setEditingField] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  // const [allenamentiDropdown, setAllenamentiDropdown] = useState([]);

  // useEffect(() => {
  //   setAllenamentiDropdown(allenamenti.map(a => a.nome) || []);
  // }, [allenamenti]);

  const startFieldEdit = (field) => {
    setEditingField(field);
  };

  const isErrorMessage = (field) => {
    if(!field) return {error: true, message: "Campo obbligatorio"};

    if(field === "nomeAllenamento" && editData.nomeAllenamento.trim() === "") {
      return {error: true, message: "Nome allenamento obbligatorio"};
    }

    if(field === "attrezzatura" && editData.attrezzatura.trim() === "") {
      return {error: true, message: "Attrezzatura obbligatoria"};
    }

    if(field === "ora" && editData.ora.trim() === "") {
      return {error: true, message: "Orario obbligatorio"};
    }

    if(field === "ora") {
      const oraRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 
      if(!oraRegex.test(editData.ora)) {
        return {error: true, message: "Formato ora non valido (HH:MM)"};
      }
    }

    if(field === "postiTotali" && editData.postiTotali.trim() === "") {
      return {error: true, message: "Posti totali obbligatori"};
    }

    if(field === "postiTotali" && (isNaN(editData.postiTotali) || editData.postiTotali < 1)) {
      return {error: true, message: "Deve essere un numero maggiore di 0"};
    }

    if(field === "postiTotali" && (Array.isArray(editData.partecipanti) && editData.partecipanti.length > (editData.postiTotali || 0))) {
      return {error: true, message: "I partecipanti superano i posti totali"};
    }
    return {error: false, message: ""};
  }

  const requestConfirm = (action, field = null, messageText = null) => {
    let message = null;
    let messageObj = {error: false, message: ""};

    if(action === "remove"){
      message = "Confermi la rimozione?";
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
    if (confirmData.action === "remove"){
      removeTurno(confirmData.field);
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

    if (field === "nomeAllenamento") {
      const allenamento = allenamenti.find(a => a.nome === value);
      const attrezzaturaString = allenamento?.attrezzatura?.join(", ") || "";
      setEditData(prev => ({ ...prev, attrezzatura: attrezzaturaString }));
      requestConfirm("save", "nomeAllenamento");
    }
  };

  return (
    <div className={styles.turnoCard}>

      {/* NOME ALLENAMENTO
      <Dropdown 
        isEditing={true} 
        isVisible={false} 
        placeholder={"Nome allenamento"} 
        fields={allenamentiDropdown}
        text={editData.nomeAllenamento} 
        onChange={(value) => handleChange("nomeAllenamento", value)}
      /> */}

      {/* TITOLO */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "title"}
          value={editData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Titolo"
        />
        {editingField === "title" ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "title")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("title")} />
        )}
      </div>

      {/* ORA */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "ora"}
          value={editData.ora}
          onChange={(e) => handleChange("ora", e.target.value)}
          placeholder="Orario"
        />
        {editingField === "ora" ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "ora")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("ora")} />
        )}
      </div>

      {/* ATTREZZATURA */}
      <div className={styles.fieldRow}>
        <input
          disabled={true}
          value={editData.attrezzatura}
        />
        <div style={{width: "20px", height: "20px",     backgroundColor: "transparent"}}></div>
      </div>

      {/* POSTI TOTALI */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "postiTotali"}
          value={editData.postiTotali}
          onChange={(e) => handleChange("postiTotali", e.target.value)}
          placeholder="Posti totali"
        />
        {editingField === "postiTotali" ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "postiTotali")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("postiTotali")} />
        )}
      </div>

      {/* NOTE */}
      <div className={styles.fieldRow}>
        <input
          disabled={editingField !== "note"}
          value={editData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Note aggiuntive"
        />
        {editingField === "note" ? (
          <div className={styles.buttonGroup}>
            <button className={styles.saveBtn} onClick={() => requestConfirm("save", "note")}>✔</button>
            <button className={styles.cancelBtn} onClick={() => cancelField()}>✘</button>
          </div>
        ) : (
          <img src={IconEdit} className={styles.editIcon} onClick={() => startFieldEdit("note")} />
        )}
      </div>

      {/* PARTECIPANTI
      <PartecipantiDropdownMenu
        key={index}
        turno={turno}
        date={date}
        onChange={(updated) => handleChange("partecipanti", updated)}
      /> */}

      {/* RIMUOVI */}
      <div className={styles.actions}>
        <button onClick={() => requestConfirm("remove")} className={styles.removeBtn}>Rimuovi</button>
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