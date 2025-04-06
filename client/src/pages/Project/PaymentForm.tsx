import { 
    Box, 
    CircularProgress, 
    Alert, 
    Typography, 
    Paper, 
    Button, 
    Snackbar,
    Card,
    CardContent,
    Container,
    Stack  } from "@mui/material";
  import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import LockIcon from '@mui/icons-material/Lock';
  import PaymentIcon from '@mui/icons-material/Payment';
  import axios from "../../utils/axios";
  
  interface ProjectPaymentProps {
      projectId: string;
      teamId: string;
  }
  
  interface ProjectDetails {
      _id: string;
      name: string;
      amount: number;
      currency: string;
      status: string;
  }
  
  const PaymentForm = ({ projectId, teamId }: ProjectPaymentProps) => {
      const stripe = useStripe();
      const elements = useElements();
      const navigate = useNavigate();
  
      const [loading, setLoading] = useState(false);
      const [projectLoading, setProjectLoading] = useState(true);
      const [success, setSuccess] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  
      useEffect(() => {
          const fetchProjectDetails = async () => {
              try {
                  setProjectLoading(true);
                  const response = await axios.get<ProjectDetails>(
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
  
          setLoading(true);
          setError(null);
  
          try {
              // Confirm card payment with the client secret
              const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
                  elements,
                  confirmParams: {
                      // Return URL where your customer should be redirected after payment
                      return_url: `${window.location.origin}/teams/id/${teamId}`,
                  },
                  redirect: 'if_required',
              });
  
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
              <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                  <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={60} thickness={4} />
                      <Typography variant="h6" sx={{ mt: 2 }}>Loading project details...</Typography>
                  </Box>
              </Container>
          );
      }
  
      if (!projectDetails) {
          return (
              <Container maxWidth="md" sx={{ mt: 4, p: 2 }}>
                  <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                          borderRadius: 2,
                          py: 2
                      }}
                  >
                      <Typography variant="subtitle1">Project not found</Typography>
                  </Alert>
              </Container>
          );
      }
  
      return (
          <Container maxWidth="md">
              <Card elevation={3} sx={{ mt: 4, mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 500 }}>
                          Checkout
                      </Typography>
                      <Typography variant="subtitle1">
                          Complete your payment to finalize
                      </Typography>
                  </Box>
  
                  <CardContent component="form" onSubmit={handleSubmit} noValidate sx={{ p: 4 }}>

  
                      <Paper 
                          elevation={0} 
                          sx={{ 
                              bgcolor: 'grey.50', 
                              p: 3, 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'grey.200',
                              mb: 4
                          }}
                      >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                      Payment Amount
                                  </Typography>
                                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'black' }}>
                                      {projectDetails.amount.toFixed(2)}
                                      <Typography component="span" variant="h5" sx={{ ml: 1 }}>
                                          {projectDetails.currency.toUpperCase()}
                                      </Typography>
                                  </Typography>
                              </Box>
                              <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                          </Stack>
                      </Paper>
  
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                          Payment Details
                      </Typography>
                      
                      <Paper 
                          elevation={0}
                          sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'grey.200',
                              mb: 4
                          }}
                      >
                          <PaymentElement />
                      </Paper>
  
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                          <LockIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                              Payments are secure and encrypted
                          </Typography>
                      </Box>
  
                      <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          disabled={!stripe || loading || projectDetails.status === 'paid'}
                          sx={{ 
                              py: 1.5, 
                              borderRadius: 2,
                              fontSize: 16,
                              fontWeight: 500,
                              textTransform: 'none',
                              boxShadow: 2
                          }}
                      >
                          {loading ? 
                              <CircularProgress size={24} color="inherit" /> : 
                              `Pay ${projectDetails.amount.toFixed(2)} ${projectDetails.currency.toUpperCase()}`
                          }
                      </Button>
                      
                      {projectDetails.status === 'paid' && (
                          <Alert severity="info" sx={{ mt: 3 }}>
                              This project has already been paid for.
                          </Alert>
                      )}
                  </CardContent>
              </Card>
  
              <Snackbar
                  open={error !== null}
                  autoHideDuration={6000}
                  onClose={() => setError(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                  <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ width: '100%', boxShadow: 3 }}
                  >
                      {error}
                  </Alert>
              </Snackbar>
  
              <Snackbar
                  open={success}
                  autoHideDuration={6000}
                  onClose={() => setSuccess(false)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                  <Alert 
                      severity="success" 
                      variant="filled"
                      sx={{ width: '100%', boxShadow: 3 }}
                  >
                      Payment successful! Redirecting to team page...
                  </Alert>
              </Snackbar>
          </Container>
      );
  };
  
  export default PaymentForm;