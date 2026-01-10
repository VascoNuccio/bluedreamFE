import React, { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';

const GestioneAllenamenti = () => {
  const { getAllenamenti, saveNuovoAllenamento } = useAuth();

  const [allenamenti, setAllenamenti] = useState([]);
  const [newAllenamento, setNewAllenamento] = useState("");
  const [loading, setLoading] = useState(false);

  // Carica gli allenamenti dal backend
  const fetchAllenamenti = async () => {
    try {
      const data = await getAllenamenti();
      setAllenamenti(data.allenamenti || []);
    } catch (err) {
      console.error("Errore caricamento allenamenti:", err);
    }
  };

  useEffect(() => {
    fetchAllenamenti();
  }, []);

  // Aggiungi nuovo allenamento
  const handleAdd = async () => {
    if (!newAllenamento.trim()) return;
    setLoading(true);
    try {
      const data = await saveNuovoAllenamento(newAllenamento);
      setAllenamenti([...allenamenti, data.category]);
      setNewAllenamento("");
    } catch (err) {
      console.error("Errore durante l'aggiunta:", err);
      alert(err.message || "Errore durante l'aggiunta");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestione Allenamenti</h2>

      {/* Form aggiungi allenamento */}
      <div className="flex mb-6 gap-2">
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Nuovo allenamento"
          value={newAllenamento}
          onChange={(e) => setNewAllenamento(e.target.value)}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Aggiungi
        </button>
      </div>

      {/* Lista allenamenti */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {allenamenti.map((a) => (
          <div key={a.id} className="border p-4 rounded shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">{a.name}</h3>
            {a.equipment && <p className="text-sm text-gray-600">Attrezzatura: {a.equipment}</p>}
          </div>
        ))}
      </div>

      {allenamenti.length === 0 && <p className="text-gray-500 mt-4">Nessun allenamento presente.</p>}
    </div>
  );
};

export default GestioneAllenamenti;
