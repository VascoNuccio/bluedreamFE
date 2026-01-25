import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Payments from "../components/payments/Payments";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState(null);

  const { signin } = useAuth();
  const navigate = useNavigate();

  // --- REGISTRAZIONE UTENTE ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signin(email, password, firstName, lastName);
      if (!res || !res.subscription) {
        setError(res?.message || "Errore registrazione");
        return;
      }

      // Mostra pagamento solo se subscription è PENDING
      if (res.subscription.status === "PENDING") {
        setShowPayment(true);
      } else {
        navigate("/user");
      }

    } catch (err) {
      setError(err.message || "Errore server");
    }
  };

  // --- Selezione metodo di pagamento ---
  const handleSelectPayment = (provider) => setPaymentProvider(provider);

  return (
    <div className="container">
      {!showPayment && (
        <form className="register-card" onSubmit={handleRegister}>
          <h1>Registrati</h1>
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <input type="text" placeholder="Nome" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
          <input type="text" placeholder="Cognome" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
          {error && <p className="error">{error}</p>}
          <button type="submit">Registrati</button>
        </form>
      )}

      {showPayment && (
        <div className="payment-container">
          <h2>Completa il pagamento</h2>
          <p>Seleziona il metodo di pagamento:</p>
          <div className="payment-buttons">
            <button onClick={() => handleSelectPayment("paypal")}>PayPal</button>
            <button onClick={() => handleSelectPayment("card")}>Carta di credito</button>
          </div>

          {paymentProvider && (
            <Payments provider={paymentProvider} />
          )}
        </div>
      )}
    </div>
  );
}
