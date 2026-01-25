import React, { use, useEffect } from 'react'
import styles from '@/assets/styles/gestioneUser.module.scss'
import { useAuth } from '@/context/AuthContext';
import DropdownList from "@/components/DropdownList";
import Collapse from '@/components/Collapse';
import OpenEye from "@/assets/icons/eye-solid-full.svg";
import CloseEye from "@/assets/icons/eye-slash-solid-full.svg";
import ConfirmPopUp from '@/components/ConfirmPopUp';

const GestioneUser = () => {
  const { user, createUser, updateUser, getAllUsers, disableUser, deleteUser, getUserStatuses, getAllGroups } = useAuth();

  const [data, setData] = React.useState(null);

  const ROLE_USER = import.meta.env.VITE_ROLE_USER;
  const ROLE_ADMIN = import.meta.env.VITE_ROLE_ADMIN;
  const SUBSCRIPTION_MONTHS = parseInt(import.meta.env.VITE_SUBSCRIPTION_MONTHS);
  const STATUS_SUBSCRIBED = import.meta.env.VITE_STATUS_SUBSCRIBED;
  
  useEffect(() => {
    getAllGroups().then(groups => {
      setData(prevData => ({...prevData, groups: groups}));
    }).catch(err => {
      console.error("Error fetching groups:", err);
    });
    getAllUsers().then(users => {
      setData(prevData => ({...prevData, users: users}));
    }).catch(err => {
      console.error("Error fetching users:", err);
    });
    getUserStatuses().then(statuses => {
      setData(prevData => ({...prevData, statuses: statuses.userStatuses}));
    }).catch(err => {
      console.error("Error fetching user statuses:", err);
    });
  }, []);

  const CreateUserForm = () => {

    const [showPassword, setShowPassword] = React.useState(false);
    const [showPopUp, setShowPopUp] = React.useState(false);

    const formatDateForInput = (date) => {
      return date.toISOString().split('T')[0];
    };

    const addMonths = (date, months) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + months);
      return newDate;
    };
    
    const today = new Date();

    const [newUser, setNewUser] = React.useState({
      "email": "",
      "password": "",
      "firstName": "",
      "lastName": "",
      "role": ROLE_USER,
      "startDate": formatDateForInput(today),
      "endDate": formatDateForInput(addMonths(today, SUBSCRIPTION_MONTHS)),
      "amount": "",
      "ingressi": "32",
      "groups": []
    });

    const [groupNames, setGroupNames] = React.useState([]);

    const handeChangeUser = (e) => {
      setNewUser({
        ...newUser,
        [e.target.name]: e.target.value
      })
    }

    const handleChange = (field, value) => {
      setNewUser({
        ...newUser,
        [field]: value
      });
    }

    const handleChangeGroup = (name) => {
      setGroupNames(prev => {
        if (prev.includes(name)) return prev; // già presente
        return [...prev, name];
      });
    
      const group = data.groups.find(g => g.name === name);
      if (!group) return;
    
      setNewUser(prev => {
        if (prev.groups.includes(group.id)) return prev; // già presente
        return {
          ...prev,
          groups: [...prev.groups, group.id]
        };
      });
    };

    const handleCancelGroup = (name) => {
      // Rimuove il nome dall’elenco
      setGroupNames(prev => prev.filter(n => n !== name));
    
      const group = data.groups.find(g => g.name === name);
      if (!group) return;
    
      // Rimuove l'id del gruppo
      setNewUser(prev => ({
        ...prev,
        groups: prev.groups.filter(id => id !== group.id)
      }));
    };

    const handleCreateUser = () =>{
      try {
        createUser(newUser)
        setShowPopUp({message: "Creato utente", isError: false});
      } catch (error) {
        setShowPopUp({message: err.error || "errore creazione user", isError: true});
      }
    }

    const onClose = () => {
      showPopUp(false);
    }

    return <form onSubmit={handleCreateUser}>
      <label>Email:</label>
      <input type="email" placeholder="email" autoComplete="new-email" name='email' value={newUser.email} onChange={handeChangeUser}/>
      <label>Password:</label>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="password"
          value={newUser.password}
          autoComplete="new-password"
          onChange={handeChangeUser}
          style={{
            width: "100%",
            paddingRight: "40px", // spazio per il pulsante
            boxSizing: "border-box"
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: "1rem"
          }}
        >
          <img src={showPassword ? CloseEye : OpenEye} alt="Toggle Password" />
        </button>
      </div>
      <label>First Name:</label>
      <input type="text" placeholder="first name" name='firstName' value={newUser.firstName} onChange={handeChangeUser}/>
      <label>Last Name:</label>
      <input type="text" placeholder="last name" name='lastName' value={newUser.lastName} onChange={handeChangeUser}/>
      <label>Role:</label>
      <DropdownList
        isEditing={true} 
        isVisible={false} 
        placeholder={"role"} 
        fields={[ROLE_USER,ROLE_ADMIN]}
        text={newUser.role} 
        onChange={(value) => handleChange("role", value)}
      />
      <h4 style={{paddingTop: "1rem"}}>Subscription Details</h4>
      <hr/>
      <label>Amount:</label>
      <input type="text" placeholder="amount" name='amount' value={newUser.amount} onChange={handeChangeUser}/>
      <label>Start Date:</label>
      <input type="date" placeholder='yyyy-mm-dd' name='startDate' value={newUser.startDate} onChange={handeChangeUser}/>
      <label>End Date:</label>
      <input type="date" placeholder='yyyy-mm-dd' name='endDate' value={newUser.endDate} onChange={handeChangeUser}/>
      
      <label>Ingressi:</label>
      <input type="text" placeholder='ingressi' name="ingressi" value={newUser.ingressi} onChange={handeChangeUser}/>
      <label>Corsi:</label>
      <DropdownList
        isEditing={true} 
        isVisible={false} 
        placeholder={"Seleziona Corsi"} 
        fields={data?.groups? data?.groups.map(group => group.name) : []}
        text={groupNames.join(", ")} 
        onChange={(value) => handleChangeGroup(value)}
        onCancel={(value) => handleCancelGroup(value)}
      />
      <div className="submitButtonForm">
          <button type='submit'>Save</button>
      </div>
      {showPopUp && <ConfirmPopUp message={showPopUp.message} onConfirm={onClose} onCancel={onClose} isError={showPopUp.isError}/>}
    </form>
  }

  const DeleteUser = () => {
    const [showPopUp, setShowPopUp] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [isError, setIsError] = React.useState(false);
    const [userIdToDelete, setUserIdToDelete] = React.useState(null);

    const handleDelete = (userId, name) => {

      if(user.id === userId){
        setMessage("You cannot delete your own account!");
        setIsError(true);
        setShowPopUp(true);
        return;
      }

      setMessage("Deleting "+name+ ". Are you sure?");
      setUserIdToDelete(userId);
      setIsError(false);
      setShowPopUp(true);
    } 

    const onConfirm = () => {
      disableUser(userIdToDelete);
      getAllUsers().then(users => {
        setData(prevData => ({...prevData, users: users}));
      }).catch(err => {
        console.error("Error fetching users:", err);
      });
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

  const UpdateUser = () => {
    const [filteredUsers, setFilteredUsers] = React.useState(data?.users || []);
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [activeSubscription, setActiveSubscription] = React.useState(null);
    const [groupNames, setGroupNames] = React.useState([]);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showPopUp, setShowPopUp] = React.useState(false);

    const addMonths = (date, months) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + months);
      return newDate;
    };

    const normalizeUserPayload = (selectedUser) => {
      if (!selectedUser) return {};

      // Prendi la subscription attiva, se presente
      const activeSub = selectedUser.subscriptions?.find(sub => sub.status === 'ACTIVE') || {};

      return {
        // Dati utente
        email: selectedUser.email ?? '',
        password: selectedUser.password ?? undefined, // opzionale
        firstName: selectedUser.firstName ?? '',
        lastName: selectedUser.lastName ?? '',
        role: selectedUser.role ?? 'USER',
        status: selectedUser.status ?? 'SUBSCRIBED',
      
        // Subscription
        id: activeSub.id? activeSub.id: undefined,
        startDate: activeSub.startDate ? activeSub.startDate.split('T')[0] : undefined,
        endDate: activeSub.endDate ? activeSub.endDate.split('T')[0] : undefined,
        amount: activeSub.amount !== undefined ? Number(activeSub.amount) : undefined,
        ingressi: activeSub.ingressi !== undefined ? Number(activeSub.ingressi) : undefined,
        currency: activeSub.currency ?? 'EUR',
      
        // Groups (array di numeri)
        groups: Array.isArray(selectedUser.groups)
          ? selectedUser.groups.map(g => typeof g === 'number' ? g : g.groupId).filter(Boolean)
          : []
      };
    };

    const handleSearchChange = (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) return setFilteredUsers(data?.users || []);
      setFilteredUsers(
        data.users.filter(
          (u) =>
            u.firstName.toLowerCase().includes(val) ||
            u.lastName.toLowerCase().includes(val) ||
            u.email.toLowerCase().includes(val)
        )
      );
    };

    const handleSelectUser = (id) => {
      const user = data.users.find(u => u.id === id);
      if (!user) return;
    
      // Livello gruppo: estrai solo gli ID numerici
      const normalizedGroups = user.groups?.map(g => Number(g.groupId)) || [];
    
      // Normalizza subscription: solo ACTIVE
      const activeSub = user.subscriptions?.find(s => s.status === 'ACTIVE') || {
        id: undefined,
        status: 'ACTIVE',
        amount: 0,
        currency: 'EUR',
        startDate: '',
        endDate: ''
      };
    
      setSelectedUser({
        ...user,
        groups: normalizedGroups,
        subscriptions: [activeSub]
      });
    
      setActiveSubscription(activeSub);
      setGroupNames(user.groups?.map(g => g.groupName) || []);
      setIsEditing(true);
    };

    const handleChangeUser = (e) => {
      const { name, value } = e.target;
      setSelectedUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleChangeSubscription = (e) => {
      const { name, value } = e.target;
    
      setSelectedUser(prevUser => {
        const subscriptions = prevUser.subscriptions ?? [];
        let updatedSubscriptions;
      
        const activeSub = subscriptions.find(sub => sub.status === 'ACTIVE');

        if (activeSub) {
          updatedSubscriptions = subscriptions.map(sub =>
            sub.status === 'ACTIVE'
              ? {
                  ...sub,
                  [name]: (name === 'amount' || name === 'ingressi') ? Number(value) : new Date(value).toISOString()
                }
              : sub
          );
        } else {
          // crea nuova ACTIVE subscription se non esiste
          const newSub = {
            id: undefined,
            status: 'ACTIVE',
            [name]: (name === 'amount' || name === 'ingressi') ? Number(value) : new Date(value).toISOString(),
          };
          if (name === 'startDate') {
            newSub.endDate = addMonths(new Date(value), SUBSCRIPTION_MONTHS).toISOString();
          }
          updatedSubscriptions = [...subscriptions, newSub];
        }

        // Calcola subito la nuova activeSubscription e restituiscila insieme
        const newActiveSub = updatedSubscriptions.find(sub => sub.status === 'ACTIVE');
        setActiveSubscription(newActiveSub); // aggiorna correttamente
      
        return {
          ...prevUser,
          subscriptions: updatedSubscriptions
        };
      });
    };

    const handleChangeGroup = (name) => {
      const group = data.groups.find((g) => g.name === name);
      if (!group) return;

      setGroupNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
      setSelectedUser((prev) =>
        prev.groups.includes(group.id)
          ? prev
          : { ...prev, groups: [...prev.groups, group.id] }
      );
    };

    const handleCancelGroup = (name) => {
      const group = data.groups.find((g) => g.name === name);
      if (!group) return;

      setGroupNames((prev) => prev.filter((n) => n !== name));
      setSelectedUser((prev) => ({
        ...prev,
        groups: prev.groups.filter((id) => id !== group.id),
      }));
    };

    const handleUpdateUser = async (e) => {
      e.preventDefault();
    
      try {
        const payload = normalizeUserPayload(selectedUser);
      
        await updateUser(selectedUser.id, payload);
      
        const users = await getAllUsers();
        setData(prev => ({ ...prev, users }));
        setIsEditing(false);
      } catch (err) {
        console.error(err)
        setShowPopUp({
          message: err.message || err,
          isError: true,
        });
      }
    };

    const handleHardDelete = () => {
      setShowPopUp({
        message: `Sei sicuro di voler cancellare definitivamente ${selectedUser?.email ?? 'user'}?`,
        isError: false,
      });
    };

    const onConfirm = async () => {
      try {
        await deleteUser(selectedUser.id);
        const users = await getAllUsers();
        setData((prev) => ({ ...prev, users }));
        setIsEditing(false);
        alert("Utente aggiornato")
      } catch (err) {
        console.error(err);
        setShowPopUp({
          message: `Errore durante la cancellazione di ${selectedUser?.email ?? 'user'}.`,
          isError: true,
        });
      }
    };

    const onCancel = () => setShowPopUp(false);

    return (
      <>
        {!isEditing && (
          <section className={styles.update_user_section}>
            <input
              className={styles.input_search_user}
              type="text"
              placeholder="Search user"
              onChange={handleSearchChange}
            />
            <div className={styles.update_user_container}>
              {filteredUsers?.map((user) => (
                <div
                  key={user.id}
                  className={styles.update_user_card}
                  onClick={() => handleSelectUser(user.id)}
                >
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Status:</strong> {user.status}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isEditing && (
          <section className={styles.update_user_section}>
            <form onSubmit={handleUpdateUser}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={selectedUser.email}
                onChange={handleChangeUser}
              />

              <label>Password:</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={selectedUser.password}
                  onChange={handleChangeUser}
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '1rem',
                  }}
                >
                  <img src={showPassword ? CloseEye : OpenEye} alt="Toggle Password" />
                </button>
              </div>

              <label>First Name:</label>
              <input type="text" name="firstName" value={selectedUser.firstName} onChange={handleChangeUser} />
              <label>Last Name:</label>
              <input type="text" name="lastName" value={selectedUser.lastName} onChange={handleChangeUser} />

              <h4>Subscription Details</h4>
              <hr />
              <label>Amount:</label>
              <input
                type="text"
                name="amount"
                value={activeSubscription?.amount || 0}
                onChange={handleChangeSubscription}
              />

              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={activeSubscription ? activeSubscription.startDate.split('T')[0] : ''}
                onChange={handleChangeSubscription}
              />

              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={activeSubscription ? activeSubscription.endDate.split('T')[0] : ''}
                onChange={handleChangeSubscription}
              />

              <label>Ingressi:</label>
              <input
                type="text"
                name="ingressi"
                value={activeSubscription ? activeSubscription.ingressi : ''}
                onChange={handleChangeSubscription}
              />

              <label>Corsi:</label>
              <DropdownList
                isEditing={true}
                isVisible={false}
                placeholder="Seleziona corsi"
                fields={data.groups?.map((g) => g.name) || []}
                text={groupNames.join(', ')}
                onChange={handleChangeGroup}
                onCancel={handleCancelGroup}
              />

              <section className={styles.buttons_edit_user_section}>
                <button type="submit" className={styles.saveBtn}>
                  Save
                </button>
                <section>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="button" className={styles.removeBtn} onClick={handleHardDelete}>
                    Rimuovi
                  </button>
                </section>
              </section>
            </form>
          </section>
        )}

        {showPopUp && (
          <ConfirmPopUp message={showPopUp.message} onConfirm={onConfirm} onCancel={onCancel} isError={showPopUp.isError} />
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Collapse title="Create User" ><CreateUserForm /></Collapse>
      <Collapse title="Delete User" ><DeleteUser/></Collapse>
      <Collapse title="Update User" ><UpdateUser/></Collapse>
    </div>
  )
}

export default GestioneUser