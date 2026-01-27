import React, { use, useEffect } from 'react'
import styles from '@/assets/styles/gestioneUser.module.scss'
import { useAuth } from '@/context/AuthContext';
import Collapse from '@/components/Collapse';
import CreateUserForm from './CreateUserForm';
import DeleteUser from './DeleteUser';
import UpdateUser from './UpdateUser';

const GestioneUser = () => {
  const { user, createUser, updateUser, getAllUsers, disableUser, deleteUser, getUserStatuses, getAllGroups } = useAuth();

  const [data, setData] = React.useState(null);
  const [refresh, setRefresh] = React.useState(false);
  
  const loadAll = async () => {
    try {
      const [groups, users, statusesData] = await Promise.all([
        getAllGroups(),
        getAllUsers(),
        getUserStatuses()
      ]);

      setData({
        groups,
        users,
        statuses: statusesData.userStatuses,
        refresh: refresh
      });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };


  useEffect(()=>{
    loadAll();
  },[refresh]);

  return (
    <div className={styles.container}>
      <Collapse title="Create User" ><CreateUserForm data={data} createUser={createUser} callback={()=>{setRefresh(!refresh)}} /></Collapse>
      <Collapse title="Delete User" ><DeleteUser user={user} disableUser={disableUser} data={data} callback={()=>{setRefresh(!refresh)}} /></Collapse>
      <Collapse title="Update User" ><UpdateUser user={user} deleteUser={deleteUser} data={data} updateUser={updateUser} callback={()=>{setRefresh(!refresh)}} /></Collapse>
    </div>
  )
}

export default GestioneUser