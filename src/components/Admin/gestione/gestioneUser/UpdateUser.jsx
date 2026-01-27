import React, { useEffect } from "react";
import styles from '@/assets/styles/gestioneUser.module.scss'
import DropdownList from "@/components/DropdownList";
import OpenEye from "@/assets/icons/eye-solid-full.svg";
import CloseEye from "@/assets/icons/eye-slash-solid-full.svg";
import ConfirmPopUp from '@/components/ConfirmPopUp';

  const UpdateUser = ({user, deleteUser, data, updateUser, callback}) => {
    const SUBSCRIPTION_MONTHS = parseInt(import.meta.env.VITE_SUBSCRIPTION_MONTHS);

    const [filteredUsers, setFilteredUsers] = React.useState(data?.users || []);
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [activeSubscription, setActiveSubscription] = React.useState(null);
    const [groupNames, setGroupNames] = React.useState([]);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showPopUp, setShowPopUp] = React.useState(false);

    React.useEffect(() => {
      setFilteredUsers(data?.users || []);
    }, [data]);

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

    const handleChangeStatus = (name, value) => {
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
      
        callback();
        setIsEditing(false);
        setShowPopUp({
          message: "Utente aggiornato correttamente",
          isError: false,
          isClose: true
        });
      } catch (err) {
        console.error(err)
        setShowPopUp({
          message: err.message || err,
          isError: true,
          isClose: true
        });
      }
    };

    const handleHardDelete = () => {
      setShowPopUp({
        message: `Sei sicuro di voler cancellare definitivamente ${selectedUser?.email ?? 'user'}?`,
        isError: false,
        isClose: false
      });
    };

    const onCancelConfirm = async () => {

        if(user.id === selectedUser.id){
          setShowPopUp({
              message: "You cannot delete your own account!",
              isError: false,
              isClose: true
          });
        }else{
            try {
                await deleteUser(selectedUser.id);
                callback();
                setIsEditing(false);
                setShowPopUp({
                  message: "Utente eliminato correttamente",
                  isError: false,
                  isClose: true
                });
            }catch (err) {
                console.error(err);
                setShowPopUp({
                  message: `Errore durante la cancellazione di ${selectedUser?.email ?? 'user'}.`,
                  isError: true,
                  isClose: false
                });
            }
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

              <label>Status:</label>
              <DropdownList
                isEditing={true}
                isVisible={false}
                placeholder="Seleziona status"
                fields={['SUBSCRIBED','CANCELLED']}
                text={selectedUser.status}
                onChange={(value) => handleChangeStatus("status",value)}
              />

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
          <ConfirmPopUp message={showPopUp.message} onConfirm={showPopUp?.isClose?onCancel:onCancelConfirm} onCancel={onCancel} isError={showPopUp.isError} />
        )}
      </>
    );
  };

export default UpdateUser;