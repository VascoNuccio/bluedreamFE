import React, { useEffect, useState } from 'react'
import styles from "@/assets/styles/dropdown.module.scss";
import IconEdit from "@/assets/modifica.svg";

const Dropdown = ({isEditing, isVisible, placeholder, isPlaceholderBlue = false, fields, text, onChange}) => {
  const [editing, setEditing] = useState(isVisible);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fieldList, setFieldList] = useState([]); // filtered fields
  const [search, setSearch] = useState(text); // testo input e ricerca

  useEffect(() => {
      setSearch(text);
  }, [text]);

  const cancelEdit = () => {
    if(isEditing) {
        setEditing(false);
    }
    setShowDropdown(false);
    setFieldList([]);
  }; 

  const handleSearchChange = (value) => {
    setSearch(value);
    setShowDropdown(true);

    if (value.length < 1) {
      setFieldList([]);
      return;
    }

    setFieldList(fields.filter((e) =>
      e.toLowerCase().includes(value.toLowerCase())
    ));
  };

  const handleSelected = (value) => {
    setSearch(value);
    onChange(value);
    if(isEditing) {
        setEditing(false);
    }
    setShowDropdown(false);
    setFieldList([]);
  }; 


  return (
    <div className={styles.container}>

      {/* INPUT DISABILITATO + MATITA */}
      {!editing && (
        <div className={styles.editHeader}>
          <input
            disabled
            className={styles.disabledInput}
            value={text}
          />
          <img src={IconEdit} className={styles.editIcon} onClick={() => setEditing(true)} />
        </div>
      )}

      {/* INPUT ATTIVO CON CHECK E X */}
      {editing && (
        <div className={styles.addContainer}>
          <input
            className={isPlaceholderBlue?styles.inputAddBlue:styles.inputAdd}
            value={search}
            placeholder={placeholder}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClick={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />

          {isEditing && <section className={styles.buttonGroup}>
            {/* ✔ conferma */}
            <button
              className={styles.saveBtn}
              onClick={() => handleSelected(search)}
            >
              ✔
            </button>
      
            {/* ✘ annulla */}
            <button className={styles.cancelBtn} onClick={cancelEdit}>
              ✘
            </button>
          </section>}

          {/* DROPDOWN */}
          {editing && showDropdown && fieldList.length > 0 && (
            <div className={styles.dropdown}>
              {fieldList.map((e) => (
                <div key={e} className={styles.dropdownRow}>
                  <span>{e}</span>

                  <section className={styles.buttonGroup} >
                    <button className={styles.saveBtn} onClick={() => handleSelected(e)}>
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
    </div>
  );
}

export default Dropdown