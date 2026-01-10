import { useEffect, useRef, useState } from "react";
import usePayments from "@/hooks/usePayments";

export default function Payments({ provider }) {
  const paypalRef = useRef();
  const { handlePayment, loading, error } = usePayments();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (provider === "paypal") {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=EUR`;
      script.addEventListener("load", () => {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: "10.00" } }]
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            const success = await handlePayment({ provider: "paypal", paymentId: details.id });
            if (success) alert("Pagamento completato!");
          },
          onError: (err) => alert("Errore PayPal")
        }).render(paypalRef.current);
      });
      document.body.appendChild(script);
    }
  }, [provider]);

  const handleCardPay = async (e) => {
    e.preventDefault();
    // Simulazione pagamento carta
    const fakePaymentId = "CARD-" + Date.now();
    const success = await handlePayment({ provider: "card", paymentId: fakePaymentId });
    if (success) alert("Pagamento completato con carta!");
  };

  if (provider === "card") {
    return (
      <form onSubmit={handleCardPay}>
        <h3>Paga con Carta</h3>
        <input type="text" placeholder="Numero carta" value={cardNumber} onChange={(e)=>setCardNumber(e.target.value)} required />
        <input type="text" placeholder="MM/YY" value={expiry} onChange={(e)=>setExpiry(e.target.value)} required />
        <input type="text" placeholder="CVV" value={cvv} onChange={(e)=>setCvv(e.target.value)} required />
        <button type="submit">Paga</button>
        {loading && <p>Caricamento...</p>}
        {error && <p style={{color:'red'}}>{error}</p>}
      </form>
    );
  }

  return <div ref={paypalRef}></div>;
}
