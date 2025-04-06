import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import axios from "../utils/axios";
// Custom hook to load Stripe public key
export const useStripeKey = () => {
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchStripeKey = async () => {
        try {
          const response = await axios.get<string>(`/get_public_stripe`);
          const publicKey = response.data;
          if (!publicKey) {
            throw new Error('Failed to retrieve Stripe public key');
          }
          setStripePromise(loadStripe(publicKey));
        } catch (err) {
          console.error('Failed to load Stripe key:', err);
          setError('Failed to initialize payment system. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchStripeKey();
    }, []);
  
    return { stripePromise, loading, error };
  
  };
  