import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../utils/axios';
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { API_URL } from '../context/AuthProvider';

interface ProjectData {
  _id: string;
  name: string;
  amount: number;
  currency: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

// Custom hook to load Stripe public key
const useStripeKey = () => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axios.get<string>(`${API_URL}/get_public_stripe`);
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


// The inner form component that handles the payment logic
const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('20');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a payment intent on the server
      const { data } = await axios.post<PaymentIntentResponse>(`/create-payment-intent`, {
        amount: parseFloat(amount),
        currency: 'usd'
      });

      // Confirm card payment with the client secret
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can add billing details here if needed
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'An error occurred with your payment');
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        setAmount('19.99'); // Reset form
        cardElement.clear();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="amount"
        label="Amount (USD)"
        name="amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputProps={{ min: "1", step: "0.01" }}
      />

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Card Details
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </Paper>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={!stripe || loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : `Pay $${amount}`}
      </Button>

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Payment successful! Thank you for your purchase.
        </Alert>
      </Snackbar>
    </Box>
  );
};

// The main checkout form component that wraps everything with Stripe Elements
const CheckOutForm = () => {
  const { stripePromise, loading: keyLoading, error: keyError } = useStripeKey();

  if (keyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (keyError) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Alert severity="error">{keyError}</Alert>
      </Box>
    );
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Checkout
          </Typography>
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <PaymentForm />
            </Elements>
          ) : (
            <Alert severity="error">
              Unable to initialize payment system.
            </Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CheckOutForm;