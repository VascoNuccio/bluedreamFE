import React from 'react';
import styles from '@/assets/styles/infoLivelliCategories.module.scss';

// Ordine e colori dei livelli
const LEVEL_COLORS = {
  ALL: '#9e9e9e',
  OPEN: '#4caf50',
  ADVANCED: '#2196f3',
  DEPTH: '#f44336'
};

const SUBSCRIPTION_COLORS = {
  true: '#2e7d32',
  false: '#b71c1c'
};

const EVENT_COLORS = {
  DESCRIPTION: '#32ACDC'
};

const LEVEL_ORDER = ['ALL', 'OPEN', 'ADVANCED', 'DEPTH'];

// Regole eventi
const eventRules = {
  TRY_DIVE: { label: 'Lezione Prova', requiresSubscription: false, allowedLevels: ['ALL'] },

  COURSE_OPEN: { label: 'Corso Open', requiresSubscription: true, allowedLevels: ['OPEN'] },
  COURSE_ADVANCED: { label: 'Corso Advanced', requiresSubscription: true, allowedLevels: ['ADVANCED'] },
  COURSE_DEPTH: { label: 'Corso Depth', requiresSubscription: true, allowedLevels: ['DEPTH'] },

  TRAINING_ALL: { label: 'Allenamento aperto a tutti', requiresSubscription: true, allowedLevels: ['ALL'] },
  TRAINING_OPEN: { label: 'Allenamento Open', requiresSubscription: true, allowedLevels: ['OPEN'] },
  TRAINING_ADVANCED: { label: 'Allenamento Advanced', requiresSubscription: true, allowedLevels: ['ADVANCED'] },
  TRAINING_DEPTH: { label: 'Allenamento Depth', requiresSubscription: true, allowedLevels: ['DEPTH'] },

  OPEN_WATER_ALL: { label: 'Acque Libere aperto a tutti', requiresSubscription: true, allowedLevels: ['ALL'] },
  OPEN_WATER_OPEN: { label: 'Acque Libere Open', requiresSubscription: true, allowedLevels: ['OPEN'] },
  OPEN_WATER_ADVANCE: { label: 'Acque Libere Advance', requiresSubscription: true, allowedLevels: ['ADVANCED'] },
  OPEN_WATER_DEPTH: { label: 'Acque Libere Depth', requiresSubscription: true, allowedLevels: ['DEPTH'] },

  Y40_ALL: { label: 'Uscita Y-40 aperto a tutti', requiresSubscription: true, allowedLevels: ['ALL'] },
  Y40_OPEN: { label: 'Uscita Y-40 Open', requiresSubscription: true, allowedLevels: ['OPEN'] },
  Y40_ADVANCED: { label: 'Uscita Y-40 Advanced', requiresSubscription: true, allowedLevels: ['ADVANCED'] },
  Y40_DEPTH: { label: 'Uscita Y-40 Depth', requiresSubscription: true, allowedLevels: ['DEPTH'] },

  EVENT_SPECIAL_FREE: { label: 'Evento Speciale Gratuito', requiresSubscription: false, allowedLevels: ['ALL'] },
  EVENT_SPECIAL: { label: 'Evento Speciale', requiresSubscription: true, allowedLevels: ['ALL'] },
  EVENT_SPECIAL_OPEN: { label: 'Evento Speciale Open', requiresSubscription: true, allowedLevels: ['OPEN'] },
  EVENT_SPECIAL_ADVANCED: { label: 'Evento Speciale Advanced', requiresSubscription: true, allowedLevels: ['ADVANCED'] },
  EVENT_SPECIAL_DEPTH: { label: 'Evento Speciale Depth', requiresSubscription: true, allowedLevels: ['DEPTH'] }
};

const InfoLivelliCategories = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Info Livelli e Categorie</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Subscription</th>
              {LEVEL_ORDER.map(level => (
                <th key={level}>{level}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(eventRules).map(([category, rule]) => (
              <tr key={category}>
                <td className={styles.category}>
                  {category}
                  <br />
                  <span className={styles.description}>{rule.label}</span>
                </td>

                <td
                  className={`${styles.subscription} ${
                    rule.requiresSubscription ? styles.yes : styles.no
                  }`}
                >
                  {rule.requiresSubscription ? '✔' : '✖'}
                </td>

                {LEVEL_ORDER.map(level => (
                  <td
                    key={level}
                    className={`${styles.level} ${
                      rule.allowedLevels.includes(level)
                        ? styles[`level_${level.toLowerCase()}`]
                        : ''
                    }`}
                  >
                    {rule.allowedLevels.includes(level) ? '✓' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfoLivelliCategories;
