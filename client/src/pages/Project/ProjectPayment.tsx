import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import axios from '../../utils/axios';
import {
  Box,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import Page from '../../components/Page';
import PaymentForm from './PaymentForm';
import { useStripeKey } from '../../hooks/useStripe';
import Loading from '../../components/Loading';

interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}





function ProjectPayment() {
  const { teamId, projectId } = useParams<{ teamId: string; projectId: string }>();
  const { stripePromise, loading: keyLoading, error: keyError } = useStripeKey();
  const [clientSecret, setClientSecret] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const createPaymentIntent = async () => {
      try {
        const { data } = await axios.post<PaymentIntentResponse>(
          `/projects/payment-intent`,
          {
            teamId: teamId,
            projectId: projectId,
            isBuy: false,
          },
        );

        setClientSecret(data.clientSecret);
        setLoading(false)
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    createPaymentIntent();
  }, [])




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


  if (loading) return <Loading />

  if (!clientSecret) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Alert severity="error">Could not initialize payment. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Page header='Payment'>

      {stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret }} >
          <PaymentForm projectId={projectId} teamId={teamId} />
        </Elements>
      ) : (
        <Alert severity="error">
          Unable to initialize payment system.
        </Alert>
      )}

    </Page >
  );
};

export default ProjectPayment;