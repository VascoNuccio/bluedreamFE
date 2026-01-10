import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, confirmPayment } = useAuth();

  /**
   * Conferma il pagamento lato server
   * @param {Object} options
   * @param {string} options.provider - Nome del provider (paypal, card, stripe ecc.)
   * @param {string} options.paymentId - ID del pagamento restituito dal provider
   * @param {number} options.subscriptionId - ID della subscription
   */
  const handlePayment = async ({ provider, paymentId, subscriptionId }) => {
    setLoading(true);
    setError(null);

    try {
      if (!subscriptionId && user?.subscription?.id) {
        subscriptionId = user.subscription.id;
      }

      if (!subscriptionId) throw new Error("Subscription mancante");

      // Usa il metodo dal context
      const res = await confirmPayment({ provider, paymentId, subscriptionId });

      setLoading(false);
      return res.success || false;
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Errore pagamento");
      setLoading(false);
      return false;
    }
  };

  return {
    handlePayment,
    loading,
    error
  };
}
