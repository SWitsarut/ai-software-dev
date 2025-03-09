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
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { AuthResponse } from './AuthContainer';




export interface LoginResponse {
  status: number,
  data: any,
  header: any
}

interface LoginFormProps {
  onAuthSuccess: (accessToken: string) => void;
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

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess, switchToRegister }) => {
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Basic email validation
    if (!userId) {
      newErrors.userId = 'userId is required';
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
    const loginData: LoginData = { userId, password }
    if (validateForm()) {
      await axios.post<AuthResponse>('http://localhost:8080/auth/login', loginData).then(res => {
        console.log(res.data?.accessToken)
        if (onAuthSuccess) {
          onAuthSuccess(res.data?.accessToken as string || "");
        }
      }).catch(e => {
        console.log('errror', e.response.data.error.name)
        const newErrors: LoginErrors = {};
        newErrors.userId = e.response.data.error.userId
        newErrors.password = e.response.data.error.password
        setErrors(newErrors)
      })
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
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
          >
            Sign In
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