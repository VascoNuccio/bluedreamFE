import React, { use, useEffect } from 'react'
import styles from '@/assets/styles/gestioneUser.module.scss'
import { useAuth } from '@/context/AuthContext';
import DropdownList from "@/components/DropdownList";
import Collapse from '@/components/Collapse';
import OpenEye from "@/assets/icons/eye-solid-full.svg";
import CloseEye from "@/assets/icons/eye-slash-solid-full.svg";
import ConfirmPopUp from '@/components/ConfirmPopUp';

const GestioneUser = () => {
  const { user, createUser, updateUser, getAllUsers, disableUser, getUserStatuses, getAllGroups } = useAuth();

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
      "email": "user@email.com",
      "password": "password123",
      "firstName": "Mario",
      "lastName": "Rossi",
      "role": ROLE_USER,
      "startDate": formatDateForInput(today),
      "endDate": formatDateForInput(addMonths(today, SUBSCRIPTION_MONTHS)),
      "amount": "120",
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

    return <form onSubmit={(e)=>{e.preventDefault(); createUser(newUser)}}>
      <label>Email:</label>
      <input type="email" placeholder="your email" name='email' value={newUser.email} onChange={handeChangeUser}/>
      <label>Password:</label>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Your password"
          value={newUser.password}
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
      <label>Groups:</label>
      <DropdownList
        isEditing={true} 
        isVisible={false} 
        placeholder={"Select groups"} 
        fields={data.groups ? data.groups.map(group => group.name) : []}
        text={groupNames.join(", ")} 
        onChange={(value) => handleChangeGroup(value)}
        onCancel={(value) => handleCancelGroup(value)}
      />
      <div className="submitButtonForm">
          <button type='submit'>Save</button>
      </div>
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
    const [filteredUsers, setFilteredUsers] = React.useState(data.users);
    const [isEditing, setIsEditing] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState("");
    const [groupNames, setGroupNames] = React.useState([]);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSearchChange = (e) => { 
      e.preventDefault();

      if(e.target.value.trim() === ""){
        setFilteredUsers(data.users);
        return;
      } 

      setFilteredUsers(data.users.filter(user => 
        user.firstName.toLowerCase().includes(e.target.value.toLowerCase()) || 
        user.lastName.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.email.toLowerCase().includes(e.target.value.toLowerCase())
      ));
    } 

    const handleSelectUser = (id, name) => {
      const user = data.users.find(u => u.id === id);

      if(!user) return; 

      setSelectedUser(user);
      setIsEditing(true);

      const userGroupNames = data.groups
        .filter(group => user.groups.includes(group.id))
        .map(group => group.name);

      setGroupNames(userGroupNames);
    }

    const handeChangeUser = (e) => {
      setSelectedUser({
        ...selectedUser,
        [e.target.name]: e.target.value
      })
    }

    const handleChange = (field, value) => {
      setSelectedUser({
        ...selectedUser,
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
    
      setSelectedUser(prev => {
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
      setSelectedUser(prev => ({
        ...prev,
        groups: prev.groups.filter(id => id !== group.id)
      }));
    };

    const handleUpdateUser = (e) => {
      e.preventDefault();
      updateUser(selectedUser.id, selectedUser).then(() => {
        getAllUsers().then(users => {
          setData(prevData => ({...prevData, users: users})); 
          setIsEditing(false);
        }).catch(err => {
          console.error("Error fetching users:", err);
        });
      }).catch(err => {
        console.error("Error updating user:", err);
      });
    }

    return <>
      {!isEditing && <section className={styles.update_user_section}> 
        <input className={styles.input_search_user} type="text" placeholder="Search user" onChange={handleSearchChange}/>
        <div className={styles.update_user_container}>
          {filteredUsers?.map((user) => (
            <div key={user.id} className={styles.update_user_card} onClick={() => handleSelectUser(user.id, user.firstName+" "+user.lastName)}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> {user.status}</p>
            </div>
          ))}
        </div>
      </section>}
      {isEditing && <section className={styles.update_user_section}>
        <form onSubmit={handleUpdateUser}>
          <label>Email:</label>
          <input type="email" placeholder="your email" name='email' value={selectedUser.email} onChange={handeChangeUser}/>
          <label>Password:</label>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Your password"
              value={selectedUser.password}
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
          <input type="text" placeholder="first name" name='firstName' value={selectedUser.firstName} onChange={handeChangeUser}/>
          <label>Last Name:</label>
          <input type="text" placeholder="last name" name='lastName' value={selectedUser.lastName} onChange={handeChangeUser}/>
          <label>Role:</label>
          <DropdownList
            isEditing={true} 
            isVisible={false} 
            placeholder={"role"} 
            fields={[ROLE_USER,ROLE_ADMIN]}
            text={selectedUser.role} 
            onChange={(value) => handleChange("role", value)}
          />
          <label>Status:</label>
          <DropdownList
            isEditing={true} 
            isVisible={false} 
            placeholder={"status"} 
            fields={data.statuses ? data.statuses: []}
            text={selectedUser.status} 
            onChange={(value) => handleChange("status", value)}
          />
          <h4 style={{paddingTop: "1rem"}}>Subscription Details</h4>
          <hr/>
          <label>Amount:</label>
          <input type="text" placeholder="amount" name='amount' value={selectedUser.amount} onChange={handeChangeUser}/>
          <label>Start Date:</label>
          <input type="date" placeholder='yyyy-mm-dd' name='startDate' value={selectedUser.startDate} onChange={handeChangeUser}/>
          <label>End Date:</label>
          <input type="date" placeholder='yyyy-mm-dd' name='endDate' value={selectedUser.endDate} onChange={handeChangeUser}/>
          <label>Groups:</label>
          <DropdownList
            isEditing={true} 
            isVisible={false} 
            placeholder={"Select groups"} 
            fields={data.groups ? data.groups.map(group => group.name) : []}
            text={groupNames.join(", ")} 
            onChange={(value) => handleChangeGroup(value)}
            onCancel={(value) => handleCancelGroup(value)}
          />
          <section className={styles.buttons_edit_user_section}>
            <button type='submit'>Save</button>
            <button type='button' onClick={() => setIsEditing(false)}>Cancel</button>
          </section>
        </form>
      </section>}
    </>
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