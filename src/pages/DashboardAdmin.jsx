import { useState } from 'react';
import { useAuth } from '../context/AuthContext'
import CalendarAdmin from '@/components/Admin/CalendarAdmin'
import GestioneUser from '@/components/Admin/gestione/GestioneUser' 
import GestioneCorsi from '@/components/Admin/gestione/GestioneCorsi'
import CaricaQuadrimeste from '@/components/Admin/gestione/CaricaQuadrimestre'
import styles from '@/assets/styles/dashboardAdmin.module.scss'
import InfoLivelliCategories from '../components/Admin/gestione/InfoLivelliCategories';

const TAB_NAME = [
  { key: "CALENDAR", label: "Calendario", role: true },
  { key: "GESTIONE_USER", label: "Utenze", role: true  },
  { key: "GESTIONE_CORSI", label: "Corsi", role: true  },
  { key: "INFO_LIVELLI_CATEGORIE", label: "Info Livelli Categorie", role: true  },
  { key: "GESTIONE_QUADRIMESTRE", label: "Carica Quadrimeste", role: false  }
];

const Tab = ({ nameOfSelected, callback, isSuperadmin }) => {
  // Filtra solo i tab visibili all'utente
  const visibleTabs = TAB_NAME.filter(tab => {

    // I tab con role false non sono visibili a tutti
    if(tab.role === false) {
      if(isSuperadmin) {
        return true;
      }
      return false;
    }
    return true;
  });

  return (
    <span className={styles.tab}>
      {visibleTabs.map((tab) => (
        <a
          key={tab.key}
          className={nameOfSelected === tab.key ? styles.selected : ''}
          onClick={() => callback(tab.key)}
        >
          {tab.label}
        </a>
      ))}
    </span>
  );
};

const DashboardAdmin = ({isSuperadmin}) => {
  const { user, logout } = useAuth()

  const [tabSelected, setTabSelected] = useState("CALENDAR");

  return (
    <div>
      <Tab nameOfSelected={tabSelected} callback={setTabSelected} isSuperadmin={isSuperadmin}/>
      {tabSelected === "CALENDAR" && <CalendarAdmin />}
      {tabSelected === "GESTIONE_USER" && <GestioneUser />}
      {tabSelected === "GESTIONE_CORSI" && <GestioneCorsi />}
      {tabSelected === "GESTIONE_QUADRIMESTRE" && <CaricaQuadrimeste />}
      {tabSelected === "INFO_LIVELLI_CATEGORIE" && <InfoLivelliCategories />}
    </div>
  )
}

export default DashboardAdmin
