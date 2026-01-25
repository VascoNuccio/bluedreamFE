import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Collapse from "@/components/Collapse";
import ConfirmPopup from "@/components/ConfirmPopUp";
import DropdownList from "@/components/DropdownList";
import styles from '@/assets/styles/gestioneAllenamenti.module.scss'

const GestioneAllenamenti = () => {
  const {
    createGroup,
    getAllGroups,
    updateGroup,
    deleteGroup,
    forceDeleteGroup,
    getAllLevel
  } = useAuth();

  const [allenamenti, setAllenamenti] = useState([]);
  const [livelli, setLivelli] = useState([]);

  const fetchAllenamenti = async () => {
    const data = await getAllGroups();
    setAllenamenti(data);
  };

  const fetchLivelli = async () => {
    const data = await getAllLevel();
    setLivelli(data);
  };

  useEffect(() => {
    fetchAllenamenti();
    fetchLivelli();
  }, []);

  const CreateGroup = () => {
    const [name, setName] = useState();
    const [level, setLevel] = useState(livelli.length > 0 ? livelli[0] : "");
    const [description, setDescription] = useState();
    const [showPopup, setShowPopup] = useState(false);
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState("");

    const handleCreate = async () => {
      try {
        if (!name.trim()) {
          setMessage("Il nome dell'allenamento è obbligatorio");
          setShowPopup(true);
          setIsError(true);
        } else if (!level.trim()) {
          setMessage("Il livello dell'allenamento è obbligatorio");
          setShowPopup(true);
          setIsError(true);
        } else{
          await createGroup({ name, level, description });
          fetchAllenamenti();
          setMessage("Allenamento creato");
          setShowPopup(true);
          setIsError(false);
          setName("");
          setLevel("");
          setDescription("");
          setId("");
        }
      } catch(err) {
        setMessage(err.message || `Errore durante la creazione dell'allenamento`);
        setShowPopup(true);
        setIsError(true);
      }
    };

    return (
      <>
        <form onSubmit={(e)=>{e.preventDefault(); handleCreate();}}>
          <label>Nome allenamento:</label>
          <input
            placeholder="Inserisci nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Livello:</label>
          <DropdownList
            placeholder="Livello allenamento:"
            fields={livelli}
            text={level}
            onChange={(e) => setLevel(e)}
          />
          <label>Descrizione allenamento:</label>
          <input
            placeholder="Inserisci descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="submitButtonForm">
              <button type='submit'>Save</button>
          </div>
        </form>

        {showPopup && (
          <ConfirmPopup
            message={message}
            isError={isError}
            onCancel={() =>{setShowPopup(false), setIsError(false)}}
          />
        )}
      </>
    );
  };

  const DeleteGroup = () => {
    const [isConfirmPopUp, setIsConfirmPopUp] = useState(false);
    const [isForcePopUp, setIsForcePopUp] = useState(false);
    const [message, setMessage] = useState(null);
    const [groupToDelete, setGroupToDelete] = useState(null);

    const handleDelete = (group) => {
      setGroupToDelete(group);
      setMessage(`Sei sicuro di voler eliminare l'allenamento "${group.name}"?`);
      setIsConfirmPopUp(true);
    };

    const handleDeleteConfirm = async () => {
      try {
        await deleteGroup(groupToDelete.id);
        fetchAllenamenti();
        setIsConfirmPopUp(false);
      } catch (err) {
        if (err.type === "HAS_USERS") {
          setMessage(
            <div>
              <p>
                Il gruppo <strong>{groupToDelete.name}</strong> ha{" "}
                <strong>{err.data.total}</strong> utenti associati:
              </p>
              <ul>
                {err.data.users.map((u) => (
                  <li key={u.id}>
                    {u.firstName} {u.lastName} – {u.email}
                  </li>
                ))}
              </ul>
              <p>Vuoi eliminare il gruppo e tutte le associazioni?</p>
            </div>
          );
          setIsForcePopUp(true);
        }
        setIsConfirmPopUp(false);
      }
    };

    const handleForceDelete = async () => {
      await forceDeleteGroup(groupToDelete.id);
      fetchAllenamenti();
      setIsForcePopUp(false);
    };

    const onCancel = () => {
      setIsConfirmPopUp(false);
      setIsForcePopUp(false);
    };

    return (
      <>
        <div className={styles.delete_group_container}>
          {allenamenti.map((g) => (
            <div
              key={g.id}
              className={styles.delete_group_card}
              onClick={() => handleDelete(g)}
            >
              <p>{g.name}</p>
            </div>
          ))}
        </div>

        {isConfirmPopUp && (
          <ConfirmPopup
            message={message}
            onConfirm={handleDeleteConfirm}
            onCancel={onCancel}
            isError={false}
          />
        )}

        {isForcePopUp && (
          <ConfirmPopup
            message={message}
            onConfirm={handleForceDelete}
            onCancel={onCancel}
            isError={false}
          />
        )}
      </>
    );
  };

  const FormUpdateGroup = ({selectGroup, callback}) => {
    const [name, setName] = useState(selectGroup.name);
    const [level, setLevel] = useState(selectGroup.level);
    const [description, setDescription] = useState(selectGroup.description);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpdate = async () => {
      try {
        if (!name || name.trim() === "") {
          setMessage("Il nome dell'allenamento è obbligatorio");
          setShowPopup(true);
          setName(selectGroup.name);
          setLevel(selectGroup.level);
          setDescription(selectGroup.description);
        }if (!level.trim()) {
          setMessage("Il livello dell'allenamento è obbligatorio");
          setShowPopup(true);
          setName(selectGroup.name);
          setLevel(selectGroup.level);
          setDescription(selectGroup.description);
        }else{
          await updateGroup(selectGroup.id, { name, level, description });
          fetchAllenamenti();
          setName("");
          setLevel("");
          setDescription("");
        }
      } catch(err) {
        setMessage(err.message || `Errore durante l'aggiornamento dell'allenamento`);
        setShowPopup(true);
        setName(selectGroup.name);
        setDescription(selectGroup.description);
      }
    };

    return (
      <>
        <form onSubmit={(e)=>{e.preventDefault(); handleUpdate();}}>
          <label>Nome allenamento:</label>
          <input
            placeholder="Inserisci nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Livello:</label>
          <DropdownList
            placeholder="Livello allenamento:"
            fields={livelli}
            text={level}
            onChange={(e) => setLevel(e)}
          />
          <label>Descrizione allenamento:</label>
          <input
            placeholder="Inserisci descrizione"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <section className={styles.buttons_edit_group_section}>
            <button type='submit'>Save</button>
            <button type='button' onClick={callback}>Cancel</button>
          </section>
        </form>

        {showPopup && (
          <ConfirmPopup
            message={message}
            isError={true}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </>
    );
  };

  const UpdateGroup = () => {
    const [filteredGroups, setFilteredGroups] = useState(allenamenti);
    const [selected, setSelected] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleSearchChange = (e) => { 
      e.preventDefault();

      if(e.target.value.trim() === ""){
        setFilteredGroups(allenamenti);
        return;
      } 

      setFilteredGroups(allenamenti.filter((g) => 
        g.name.toLowerCase().includes(e.target.value.toLowerCase())
      ));
    } 
    
    const selectGroup = (g) => {
      setSelected(g);
      setIsEditing(true);
    };
  
    return (
      <>
        <section className={styles.update_group_section}> 
        {!isEditing && <>
          <input className={styles.input_search_group} type="text" placeholder="Search group" onChange={handleSearchChange}/>
            <div className={styles.update_group_container}>
            {filteredGroups.map((g) => (
              <div
                key={g.id}
                className={styles.update_group_card}
                onClick={() => selectGroup(g)}
              >
                {g.name}
              </div>
            ))}
          </div>
        </>}
        {isEditing && <FormUpdateGroup selectGroup={selected} callback={()=>setIsEditing(false)}/> }
        </section> 
      </>
    );
  };

  return (
    <div className={styles.container}>
      <Collapse title="Crea Allenamento">
        <CreateGroup />
      </Collapse>

      <Collapse title="Cancella Allenamento">
        <DeleteGroup />
      </Collapse>

      <Collapse title="Modifica Allenamento">
        <UpdateGroup />
      </Collapse>
    </div>
  );
};

export default GestioneAllenamenti;
