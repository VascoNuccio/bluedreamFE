import React, { useEffect, useRef, useState } from 'react'
import styles from "@/assets/styles/dropdown.module.scss";
import IconEdit from "@/assets/modifica.svg";

const Dropdown = ({placeholder, fields, text, onChange, onCancel}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cancelEdit = (value) => {
    if(onCancel)
      onCancel(value);
    setShowDropdown(false);
  }; 

  const handleSelected = (value) => {
    onChange(value);
    setShowDropdown(false);
  }; 


  return (
    <div className={styles.container} ref={containerRef}>

      {/* INPUT */}
        <div className={styles.addContainer}>
          <button
            type="button"
            className={styles.fakeInput}
            onClick={() => {
              setShowDropdown(true);
            }}
          >
            {text || placeholder}
          </button>

          {/* DROPDOWN */}
          {showDropdown && fields.length > 0 && (
            <div className={styles.dropdown}>
              {fields.map((e) => (
                <div key={e} className={styles.dropdownRow}>
                  <span>{e}</span>

                  <section className={styles.buttonGroup} >
                    <button className={styles.saveBtn} onClick={() => handleSelected(e)}>
                      ✔
                    </button>
                
                    <button
                      className={styles.cancelBtn}
                      onClick={() => cancelEdit(e)}
                    >
                      ✘
                    </button>
                  </section>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}

export default Dropdown