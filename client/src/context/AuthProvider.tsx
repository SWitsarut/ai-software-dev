import React, { createContext, useState, ReactNode, useEffect } from 'react';
import axios from '../utils/axios';

// Types
export interface User {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
}

// Define response types
interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface MeResponse {
    user: User;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    login: (userId: string, password: string) => Promise<string>;
    register: (userData: RegisterData) => Promise<string>;
    logout: () => void;
    error: string | null;
}

export interface RegisterData {
    userId: string;
    name: string;
    phoneNumber: string;
    email: string;
    password: string;
}

interface AuthProviderProps {
    children: ReactNode;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL - replace with your actual API endpoint
export const API_URL = 'http://localhost:8080';


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is already logged in
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Configure axios to use the token
                setAuthHeader(token);

                // Verify token with backend
                const response = await axios.get<MeResponse>(`/auth/me`);
                setUser(response.data.user);
                setIsLoading(false);
            } catch (err) {
                console.error('Token verification failed:', err);
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
                setIsLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    // Set auth token in axios headers
    const setAuthHeader = (token: string | null) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Login function
    const login = async (userId: string, password: string): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post<AuthResponse>(`/auth/login`, {
                userId,
                password
            });

            const { accessToken, user } = response.data;

            // Save token to localStorage
            localStorage.setItem('authToken', accessToken);
            setToken(accessToken);
            setUser(user);
            setAuthHeader(accessToken);
            return accessToken;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData: RegisterData): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post<AuthResponse>(`/auth/register`, userData);

            const { accessToken, user } = response.data;

            // Save token to localStorage
            localStorage.setItem('authToken', accessToken);
            setToken(accessToken);
            setUser(user);
            setAuthHeader(accessToken);
            return accessToken;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setAuthHeader(null);
    };

    // Context value
    const value = {
        user,
        setUser,
        token,
        setToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};