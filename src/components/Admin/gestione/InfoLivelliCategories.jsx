import React from 'react';

// Ordine e colori dei livelli
const LEVEL_COLORS = {
  ALL: '#9e9e9e',
  OPEN: '#4caf50',
  ADVANCED: '#2196f3',
  DEPTH: '#f44336'
};

const SUBSCRIPTION_COLORS = {
  true: '#2e7d32',   // verde scuro
  false: '#b71c1c'   // rosso scuro
};

const EVENT_COLORS = {
  DESCRIPTION: '#32ACDC'
}

// Livelli in ordine gerarchico
const LEVEL_ORDER = ['ALL', 'OPEN', 'ADVANCED', 'DEPTH'];

// Regole eventi
// Regole eventi (source of truth)
const eventRules = {
  TRY_DIVE: {label: 'Lezione Prova',requiresSubscription: false,allowedLevels: ['ALL']},
  // Corsi
  COURSE_OPEN: {label:'Corso Open', requiresSubscription: true, allowedLevels: ['OPEN']},
  COURSE_ADVANCED: {label: 'Corso Advanced', requiresSubscription: true, allowedLevels: ['ADVANCED']},
  COURSE_DEPTH: {label: 'Corso Depth', requiresSubscription: true, allowedLevels: ['DEPTH']},
  // Allenamenti
  TRAINING_ALL: {label: 'Allenamento aperto a tutti',requiresSubscription: true,allowedLevels: ['ALL']},
  TRAINING_OPEN: {label: 'Allenamento Open',requiresSubscription: true,allowedLevels: ['OPEN']},
  TRAINING_ADVANCED: {label: 'Allenamento Advanced',requiresSubscription: true,allowedLevels: ['ADVANCED']},
  TRAINING_DEPTH: {label: 'Allenamento Depth',requiresSubscription: true,allowedLevels: ['DEPTH']},

  // Acque libere
  OPEN_WATER_OPEN: {label: 'Acque Libere Open',requiresSubscription: true,allowedLevels: ['OPEN']},
  OPEN_WATER_ADVANCE: {label: 'Acque Libere Advance',requiresSubscription: true,allowedLevels: ['ADVANCED']},
  OPEN_WATER_DEPTH: {label: 'Acque Libere Depth',requiresSubscription: true,allowedLevels: ['DEPTH']},

  // Y-40
  Y40_ALL: {label: 'Uscita Y-40 aperto a tutti',requiresSubscription: true,allowedLevels: ['ALL']},
  Y40_OPEN: {label: 'Uscita Y-40 Open',requiresSubscription: true,allowedLevels: ['OPEN']},
  Y40_ADVANCED: {label: 'Uscita Y-40 Advanced',requiresSubscription: true,allowedLevels: ['ADVANCED']},
  Y40_DEPTH: {label: 'Uscita Y-40 Depth',requiresSubscription: true,allowedLevels: ['DEPTH']},

  // Eventi speciali
  EVENT_SPECIAL_FREE: {label: 'Evento Speciale Gratuito',requiresSubscription: false,allowedLevels: ['ALL']},
  EVENT_SPECIAL: {label: 'Evento Speciale',requiresSubscription: true,allowedLevels: ['ALL']},
  EVENT_SPECIAL_OPEN: {label: 'Evento Speciale Open',requiresSubscription: true,allowedLevels: ['OPEN']},
  EVENT_SPECIAL_ADVANCED: {label: 'Evento Speciale Advanced',requiresSubscription: true,allowedLevels: ['ADVANCED']},
  EVENT_SPECIAL_DEPTH: {label: 'Evento Speciale Depth',requiresSubscription: true,allowedLevels: ['DEPTH']}
};


const InfoLivelliCategories = () => {
  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Info Livelli e Categorie</h2>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={th}>Categoria</th>
            <th style={th}>Subscription</th>
            {LEVEL_ORDER.map(level => (
              <th key={level} style={th}>{level}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Object.entries(eventRules).map(([category, rule]) => (
            <tr key={category}>
              <td style={td}>
                {category}<br/>
                <span style={{color: EVENT_COLORS.DESCRIPTION}}>{rule.label}</span>
              </td>

              {/* Subscription */}
              <td
                style={{
                  ...td,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: SUBSCRIPTION_COLORS[rule.requiresSubscription]
                }}
              >
                {rule.requiresSubscription ? '✔' : '✖'}
              </td>

              {/* Livelli */}
              {LEVEL_ORDER.map(level => (
                <td
                  key={level}
                  style={{
                    ...td,
                    textAlign: 'center',
                    backgroundColor: rule.allowedLevels.includes(level)
                      ? LEVEL_COLORS[level]
                      : 'transparent',
                    color: rule.allowedLevels.includes(level) ? '#fff' : '#000'
                  }}
                >
                  {rule.allowedLevels.includes(level) ? '✓' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Stili base
const th = {
  border: '1px solid #ccc',
  padding: '8px',
  background: 'transparent'
};

const td = {
  border: '1px solid #ccc',
  padding: '8px'
};

export default InfoLivelliCategories;
