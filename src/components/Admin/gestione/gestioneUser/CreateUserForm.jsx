import React from "react";
import DropdownList from "@/components/DropdownList";
import OpenEye from "@/assets/icons/eye-solid-full.svg";
import CloseEye from "@/assets/icons/eye-slash-solid-full.svg";
import ConfirmPopUp from '@/components/ConfirmPopUp';

const CreateUserForm = ({data, createUser, callback}) => {

    const ROLE_USER = import.meta.env.VITE_ROLE_USER;
    const ROLE_ADMIN = import.meta.env.VITE_ROLE_ADMIN;
    const SUBSCRIPTION_MONTHS = parseInt(import.meta.env.VITE_SUBSCRIPTION_MONTHS);

    const [showPassword, setShowPassword] = React.useState(false);
    const [showPopUp, setShowPopUp] = React.useState(null);

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

    const handleCreateUser = (e) =>{
        e.preventDefault();

        createUser(newUser).then(data => {
                callback();
                setShowPopUp({message: "Utente creato", isError: false});
            }).catch(err => {
            setShowPopUp({message: err?.message || "errore creazione user", isError: true});
        });
    }

    const onClose = () => {
      setShowPopUp(false);
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

  export default CreateUserForm;