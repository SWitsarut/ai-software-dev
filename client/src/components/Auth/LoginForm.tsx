import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../hooks/useAuth';

export interface LoginResponse {
  status: number,
  data: any,
  header: any
}

interface LoginFormProps {
  onAuthSuccess: (accessToken: string) => void;
  onSubmit: (userId: string, password: string) => Promise<void>;
  switchToRegister: () => void;
}

export interface LoginData {
  userId: string;
  password: string;
}

interface LoginErrors {
  userId?: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess, onSubmit, switchToRegister }) => {
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { error: authError, isLoading } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Basic validation
    if (!userId) {
      newErrors.userId = 'Username is required';
    }

    // Basic password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      console.log(userId,password)
      try {
        await onSubmit(userId, password);
      } catch (error: any) {
        // Handle errors if onSubmit doesn't handle them
        const newErrors: LoginErrors = {};
        if (error.response?.data?.error) {
          newErrors.userId = error.response.data.error.userId;
          newErrors.password = error.response.data.error.password;
        }
        setErrors(newErrors);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  // If there's an auth error from the context, update the local errors
  React.useEffect(() => {
    if (authError) {
      setErrors({ userId: authError });
    }
  }, [authError]);

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Username"
            name="name"
            autoFocus
            value={userId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
            error={!!errors.userId}
            helperText={errors.userId}
            disabled={isSubmitting || isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            id="password"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            disabled={isSubmitting || isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2" onClick={switchToRegister}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;