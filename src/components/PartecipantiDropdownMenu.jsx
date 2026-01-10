// PartecipantiSelector.jsx — EDIT MODE + CHECK & X NEXT TO INPUT
import React, { useState, useEffect } from "react";
import ConfirmPopup from "@/components/ConfirmPopUp";
import IconEdit from "@/assets/modifica.svg";
import styles from "@/assets/styles/partecipantiDropdownMenu.module.scss";
import { useAuth } from '@/context/AuthContext';

const PartecipantiSelector = ({date, turno, onChange }) => {
  const { getUsers, deletePartecipanteOnTurno, savePartecipanteOnTurno } = useAuth();

  const [selected, setSelected] = useState(turno.partecipanti || []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const [user, setUser] = useState([]);

  useEffect(() => { 
    // fetch db get all users
    getUsers().then(async (data) => {
      setUser(data.users || []);
    }).catch((err) => {
      setUser([]);
      console.error("Errore caricamento utenti");
    });
  }, []);

  useEffect(() => {
    setSelected(turno.partecipanti || []);
  }, [turno.partecipanti]);

  const removePartecipante = (email) => {
    setConfirmData({ email, message: "Confermi la rimozione del partecipante?", error: false });
  };

  const confirmRemove = () => {
    if (!confirmData) return;

    // query DB delete partecipante
    deletePartecipanteOnTurno(confirmData.email, date, turno)
      .then((data) => { 
        setSelected(data.turno.partecipanti);
        onChange(data.turno.partecipanti);
        setConfirmData(null);   
      })
      .catch((err) => {
        console.error("Errore rimozione partecipante:", err);
      });
  };

  const cancelConfirm = () => setConfirmData(null);

  const handleSearchChange = (value) => {
    setSearch(value);
    setShowDropdown(true);

    if (value.length < 1) {
      setSuggestedUsers([]);
      return;
    }

    setSuggestedUsers(user.filter((email) =>
      email.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const isErrorMessage = (email) => {

    if (!email || email.trim() === "") {
      return { error: true, message: "Non hai selezionato nessun partecipante" };
    }

    if (selected.includes(email)) {
      return { error: true, message: "Partecipante già aggiunto" };
    }

    if (user.length <= 0 || user.length > 0 && !user.includes(email)) {
      return { error: true, message: "Partecipante non iscritto, registrare l'utente per poterlo aggiungere" };
    }

    if (turno.postiTotali && selected.length >= turno.postiTotali) {
      return { error: true, message: "Non ci sono più posti disponibili" };
    }

    return { error: false, message: "" };
  }

  const addUser = (email) => {
    let messageObj = isErrorMessage(email);

    if (messageObj.error){
      setConfirmData({ email, message: messageObj.message, error: true });
      return;
    }

    if (!selected.includes(email)) {
      // query DB insert partecipante
      savePartecipanteOnTurno(email, date, turno)
        .then((data) => {
          let updated = [...selected, email];
          setSelected(updated);
          onChange(updated);
        })
        .catch((err) => {
          console.error("Errore aggiunta partecipante:", err);
        });
    }

    setSearch("");
    setSuggestedUsers([]);
    setShowDropdown(false);
    setEditing(false);
  };

  const cancelEdit = () => {
    setSearch("");
    setSuggestedUsers([]);
    setEditing(false);
  };

  return (
    <div className={styles.container}>

      {/* INPUT DISABILITATO + MATITA */}
      {!editing && (
        <div className={styles.editHeader}>
          <input
            disabled
            className={styles.disabledInput}
            value={selected.join(", ")}
          />
          <img src={IconEdit} className={styles.editIcon} onClick={() => setEditing(true)} />
        </div>
      )}

      {/* INPUT ATTIVO CON CHECK E X */}
      {editing && (
        <div className={styles.addContainer}>
          <input
            className={styles.inputAdd}
            value={search}
            placeholder="Aggiungi partecipante..."
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />

          <section className={styles.buttonGroup}>
            {/* ✔ conferma */}
            <button
              className={styles.saveBtn}
              onClick={() => addUser(search)}
            >
              ✔
            </button>
      
            {/* ✘ annulla */}
            <button className={styles.cancelBtn} onClick={cancelEdit}>
              ✘
            </button>
          </section>

          {/* DROPDOWN */}
          {editing && showDropdown && suggestedUsers.length > 0 && (
            <div className={styles.dropdown}>
              {suggestedUsers.map((email) => (
                <div key={email} className={styles.dropdownRow}>
                  <span>{email}</span>

                  <section className={styles.buttonGroup} >
                    <button className={styles.saveBtn} onClick={() => addUser(email)}>
                      ✔
                    </button>
                
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelEdit}
                    >
                      ✘
                    </button>
                  </section>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LISTA PARTECIPANTI */}
      {editing && <div className={styles.selectedList}>
        {selected.map((email) => (
          <div key={email} className={styles.selectedItem}>
            <span>{email}</span>
            <button
              className={styles.removeBtn}
              onClick={() => removePartecipante(email)}
            >
              ✘
            </button>
          </div>
        ))}
      </div>}

      {/* POPUP CONFERMA */}
      {confirmData && (
        <ConfirmPopup
          isError={confirmData.error}
          message={confirmData.message}
          onConfirm={confirmRemove}
          onCancel={cancelConfirm}
        />
      )}
    </div>
  );
};

export default PartecipantiSelector;
