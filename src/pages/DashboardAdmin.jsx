import { useState } from 'react';
import { useAuth } from '../context/AuthContext'
import CalendarAdmin from '@/components/Admin/CalendarAdmin'
import GestioneUser from '@/components/Admin/gestione/GestioneUser' 
import GestioneAllenamenti from '@/components/Admin/gestione/GestioneAllenamenti'
import CaricaQuadrimeste from '@/components/Admin/gestione/CaricaQuadrimestre'
import styles from '@/assets/styles/dashboardAdmin.module.scss'

const TAB_NAME = {
  CALENDAR: "Calendario",
  GESTIONE_USER: "Utenze",
  GESTIONE_ALLENAMENTI: "Allenamenti",
  GESTIONE_QUADRIMESTRE: "Carica Quadrimeste"
}

const Tab = ({ nameOfSelected, callback }) => {
  return (
    <span className={styles.tab}>
      {Object.values(TAB_NAME).map((tab) => (
        <a
          key={tab}
          className={nameOfSelected === tab ? styles.selected : ''}
          onClick={() => callback(tab)}
        >
          {tab}
        </a>
      ))}
    </span>
  );
};

const DashboardAdmin = () => {
  const { user, logout } = useAuth()

  const [tabSelected, setTabSelected] = useState(TAB_NAME.CALENDAR);

  return (
    <div>
      <Tab nameOfSelected={tabSelected} callback={setTabSelected} />
      {tabSelected === TAB_NAME.CALENDAR && <CalendarAdmin />}
      {tabSelected === TAB_NAME.GESTIONE_USER && <GestioneUser />}
      {tabSelected === TAB_NAME.GESTIONE_ALLENAMENTI && <GestioneAllenamenti />}
      {tabSelected === TAB_NAME.GESTIONE_QUADRIMESTRE && <CaricaQuadrimeste />}
    </div>
  )
}

export default DashboardAdmin
