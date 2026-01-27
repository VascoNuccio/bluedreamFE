import React, { useEffect } from "react";
import styles from '@/assets/styles/gestioneUser.module.scss'
import ConfirmPopUp from '@/components/ConfirmPopUp';

  const DeleteUser = ({user, disableUser, data, callback}) => {

    const STATUS_SUBSCRIBED = import.meta.env.VITE_STATUS_SUBSCRIBED;

    const [showPopUp, setShowPopUp] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [isError, setIsError] = React.useState(false);
    const [userIdToDelete, setUserIdToDelete] = React.useState(null);

    useEffect(()=>{
        setUserIdToDelete(null);
    },[data]);

    const handleDelete = (userId, name) => {

      if(user.id === userId){
        setMessage("You cannot delete your own account!");
        setIsError(true);
        setShowPopUp(true);
      }else{
        setMessage("Deleting "+name+ ". Are you sure?");
        setUserIdToDelete(userId);
        setIsError(false);
        setShowPopUp(true);
      }
    } 

    const onConfirm = () => {
      disableUser(userIdToDelete);
      callback();
      setShowPopUp(false);
    } 

    const onCancel = () => {
      setShowPopUp(false);
    }

    return<>
    <div className={styles.delete_user_container}>
      {data?.users?.map((user) => user.status === STATUS_SUBSCRIBED && (
        <div key={user.id} className={styles.delete_user_card} onClick={() => handleDelete(user.id, user.firstName+" "+user.lastName)}>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status}</p>
        </div>
      ))}
    </div>
    {showPopUp && <ConfirmPopUp message={message} onConfirm={onConfirm} onCancel={onCancel} isError={isError}/>}
    </> 
  }

export default DeleteUser;