import React from "react";
import styles from "@/assets/styles/turno.module.scss";
import { useAuth } from "@/context/AuthContext";
import Info from "@/assets/info.svg";

const Turno = ({
  numero, // index
  titolo, // title
  description = "", //description
  ora, // startTime - endTime
  attrezzatura = "", // equipment
  note = "", // note
  partecipanti = [], // partecipanti
  postiTotali = 0, // maxSlots
  minLevel, // minLevel
  canBook, // canBook
  isFull,
  onPrenota,
  onDisdici
}) => {

  const { user } = useAuth();

  console.log("user :", user);
  console.log("minLevel e canBook :", minLevel, canBook);

  const total = Number(postiTotali) || 0;
  const partCount = Array.isArray(partecipanti) ? partecipanti.length : 0;
  const quasiPieno = total > 0 ? (partCount / total) >= 0.7 : false;
  const postiLiberi = Math.max(0, total - partCount);

  const isBlocked = partecipanti.some(p => p === user?.email);

  const classNames = [
    styles.turnoContainer,
    isFull ? styles.pieno : "",
    (!isFull && quasiPieno) ? styles.quasiPieno : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={classNames}>

      <div className={styles.turnoHeader}>

        {/* RIGA 1 */}
        <h4 className={styles.turnoTitle}>{titolo ?? `Turno ${numero}`}</h4>

        <div className={styles.orarioContainer}>
          <span className={styles.turnoOra}>{ora ?? "-"}</span>
        </div>

        {/* RIGA 2 */}
        {description && (
          <span className={styles.description}>{description}</span>
        )}

        <div className={styles.infoWrapper}>
          <img src={Info} alt="info" className={styles.infoIcon} />

          {attrezzatura && (
            <div className={styles.tooltip}>
              <strong>Attrezzatura:</strong><br />
              {Array.isArray(attrezzatura)
                ? attrezzatura.join(", ")
                : attrezzatura}
            </div>
          )}
        </div>

      </div>

      <section className={styles.infoContainer}>
        {/* Info turni */}
        <div className={styles.turnoInfo}>
          <p><strong>Posti liberi: </strong>{postiLiberi}</p>
        </div>

        {/* Info turni */}
        <div className={styles.turnoInfo}>
          <p><strong>Livello: <span className={canBook?styles.green:styles.red}>{minLevel}</span></strong></p>
        </div>

        {/* Info note */}
        {note && <div className={styles.noteInfo}>
          <p><strong>Note:</strong></p>
          <p>{note}</p>
        </div>}
      </section>

      {/* Bottoni */}
      <div className={styles.turnoActions}>
        {!isBlocked && !isFull && canBook &&(
          <button className={styles.prenotaBtn} onClick={onPrenota}>
            Prenota
          </button>
        )}

        {!isBlocked && isFull && (
          <button className={styles.fullBtn} disabled>
            Turno pieno
          </button>
        )}

        {isBlocked && (
          <button className={styles.disdiciBtn} onClick={onDisdici}>
            Disdici
          </button>
        )}
      </div>

    </div>
  );
};

export default Turno;
