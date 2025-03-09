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
import { AuthResponse } from './AuthContainer';
import axios from 'axios';
interface RegisterFormProps {
    onAuthSuccess: (accessToken: string) => void;
    switchToLogin: () => void;
}

export interface RegisterData {
    userId: string;
    name: string;
    phoneNumber: string;
    email: string;
    password: string;
}

interface RegisterErrors {
    username?: string;
    name?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onAuthSuccess, switchToLogin }) => {
    const [userId, setUserId] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<RegisterErrors>({});

    const validateForm = (): boolean => {
        const newErrors: RegisterErrors = {};

        // Name validation
        if (!userId.trim()) {
            newErrors.username = 'username is required';
        }

        if (!name.trim()) {
            newErrors.name = 'username is required';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'phoneNumber is required';
        }

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (validateForm()) {
            const registerData = { userId, name, phoneNumber, email, password };
            await axios.post<AuthResponse>('http://localhost:8080/auth/register', registerData).then(res => {
                console.log(res)
                if (onAuthSuccess) {
                    onAuthSuccess(res.data?.accessToken as string || "");
                }
            }).catch(e => {
                console.log('errror', e.response.data.error.name)
                const newErrors: RegisterErrors = {};
                newErrors.username = e.response.data.error.username
                newErrors.name = e.response.data.error.name
                newErrors.password = e.response.data.error.password
                newErrors.confirmPassword = e.response.data.error.confirmPassword
                newErrors.phoneNumber = e.response.data.error.phoneNumber
                newErrors.email = e.response.data.error.email
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
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <TextField
                                // autoComplete="given-name"
                                name="userId"
                                required
                                fullWidth
                                id="userId"
                                label="User Id"
                                autoFocus
                                value={userId}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                autoComplete="given-name"
                                name="name"
                                required
                                fullWidth
                                id="name"
                                label="Name"
                                value={name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                required
                                fullWidth
                                id="phoneNumber"
                                label="Phone number"
                                name="phone number"
                                autoComplete="family-name"
                                value={phoneNumber}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                id="password"
                                autoComplete="new-password"
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
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="#" variant="body2" onClick={switchToLogin}>
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterForm;