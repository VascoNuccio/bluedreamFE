// PartecipantiSelector.jsx — EDIT MODE + CHECK & X NEXT TO INPUT
import React, { useState, useEffect } from "react";
import ConfirmPopup from "@/components/ConfirmPopUp";
import IconEdit from "@/assets/modifica.svg";
import styles from "@/assets/styles/partecipantiDropdownMenu.module.scss";
import { useAuth } from '@/context/AuthContext';

const PartecipantiSelector = ({turno, onChange, isDisabled = true, placeholder }) => {
  const { getAllUsers, deletePartecipantiOnTurno, addPartecipantiOnTurno } = useAuth();

  const [selected, setSelected] = useState(turno.partecipanti || []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [confirmData, setConfirmData] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => { 
    // fetch db get all users
    getAllUsers().then(async (data) => {
      setUsers(data);
    }).catch((err) => {
      setUsers([]);
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
    if (!confirmData.email) return;

    const userId = users.find(u => u.email === confirmData.email)?.id;
    if (!userId) {
      setConfirmData({email, message: "Non esiste l'utente selezionato", error: true });
      return;
    }

    // query DB delete partecipante (ADMIN)
    deletePartecipantiOnTurno(turno.id, [userId])
      .then(() => {
        // aggiorno lo stato LOCALMENTE (optimistic update)
        const updatedPartecipanti = selected.filter(
          p => p !== confirmData.email
        );
      
        setSelected(updatedPartecipanti);
        onChange(updatedPartecipanti);
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

    if (!value || value.trim() === "") {
      setSuggestedUsers(users);
      return;
    }

    setSuggestedUsers(
      users.filter(u =>
        `${u.email} ${u.firstName ?? ''} ${u.lastName ?? ''}`
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    );

  };

  const addUser = (user) => {

    if (turno.id && typeof user === "object" && user.id) {
      // query DB insert partecipante
      addPartecipantiOnTurno(turno.id, [user.id])
        .then(() => {
          // evita duplicati
          if (selected.some(u => u.id === user.id)) return;
        
          const updatedPartecipanti = [...selected, user.email];
        
          setSelected(updatedPartecipanti);
          onChange(updatedPartecipanti);
        })
        .catch((err) => {
          setConfirmData({message: err.message || "Errore aggiunta partecipante", error: true });
        });
    }else{
        setConfirmData({ message: "Devi selezionare un partecipante", error: true });
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
            placeholder={placeholder}
            className={styles.disabledInput}
            value={selected.join(", ")}
          />
          {isDisabled && <img src={IconEdit} className={styles.editIcon} onClick={() => setEditing(true)} />}
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
              {suggestedUsers.map((u) => (
                <div key={u.id} className={styles.dropdownRow}>
                  <span>{u.firstName} {u.lastName}</span>
                  <small>{u.email}</small>


                  <section className={styles.buttonGroup} >
                    <button className={styles.saveBtn} onClick={() => addUser(u)}>
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
