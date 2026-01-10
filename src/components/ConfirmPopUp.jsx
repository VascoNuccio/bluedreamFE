import React from 'react';
import styles from '@/assets/styles/confirmPopup.module.scss';

// CONFIRM POPUP
const ConfirmPopup = ({ message, onConfirm, onCancel, isError = false}) => {
  return (
    <div className={styles.popupOverlay} onClick={onCancel}>
      {isError && <p className={styles.error}>{message}</p>}
      {!isError && <div className={styles.popupBox}>
        <p>{message}</p>
        <div className={styles.popupActions}>
          <button className={styles.saveBtn} onClick={onConfirm}>✔</button>
          <button className={styles.cancelBtn} onClick={onCancel}>✘</button>
        </div>
      </div>}
    </div>
  );
};

export default ConfirmPopup;