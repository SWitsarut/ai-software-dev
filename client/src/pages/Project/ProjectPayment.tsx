import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../../utils/axios';
import {
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import { API_URL } from '../../context/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import Page from '../../components/Page';

interface ProjectPaymentProps {
  projectId: string;
  teamId: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

interface ProjectDetails {
  _id: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
}

// Custom hook to load Stripe public key
const useStripeKey = () => {
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

// The inner payment form component
const PaymentForm = ({ projectId, teamId }: ProjectPaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setProjectLoading(true);
        const response = await axios.get<ProjectDetails>(
          // `/teams/${teamId}/projects/${projectId}`,
          `/projects/detailed/${teamId}/projects/${projectId}`,
        );

        setProjectDetails(response.data);

        // Check if project is already paid
        if (response.data.status === 'paid') {
          setError('This project has already been paid for.');
        }

      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Could not load project details. Please try again later.');
      } finally {
        setProjectLoading(false);
      }
    };

    if (projectId && teamId) {
      fetchProjectDetails();
    }
  }, [projectId, teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !projectDetails) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a payment intent on the server for the project
      const { data } = await axios.post<PaymentIntentResponse>(
        `/projects/payment-intent`,
        {
          teamId:teamId,
          projectId:projectId
        },
      );

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
        // Wait 2 seconds before redirecting to give the user time to see the success message
        setTimeout(() => {
          navigate(`/teams/id/${teamId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (projectLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!projectDetails) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Alert severity="error">Project not found</Alert>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h5" gutterBottom>
        Project: {projectDetails.name}
      </Typography>

      <Box sx={{ my: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Payment Amount
        </Typography>
        <Typography variant="h4" sx={{ color: 'primary.main' }}>
          {projectDetails.amount.toFixed(2)} {projectDetails.currency.toUpperCase()}
        </Typography>
      </Box>

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
        disabled={!stripe || loading || projectDetails.status === 'paid'}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : `Pay ${projectDetails.amount.toFixed(2)} ${projectDetails.currency.toUpperCase()}`}
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
          Payment successful! Redirecting to team page...
        </Alert>
      </Snackbar>
    </Box>
  );
};

function ProjectPayment() {
  const { teamId, projectId } = useParams<{ teamId: string; projectId: string }>();
  const { stripePromise, loading: keyLoading, error: keyError } = useStripeKey();

  if (!teamId || !projectId) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Missing team or project ID</Alert>
      </Container>
    );
  }

  if (keyLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (keyError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{keyError}</Alert>
      </Container>
    );
  }

  return (
    <Page header='Payment'>
      <Paper elevation={3} sx={{ p: 4 }}>

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <PaymentForm projectId={projectId} teamId={teamId} />
          </Elements>
        ) : (
          <Alert severity="error">
            Unable to initialize payment system.
          </Alert>
        )}
      </Paper>
    </Page>
  );
};

export default ProjectPayment;