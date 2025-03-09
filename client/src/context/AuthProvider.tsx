import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';

// Types
interface User {
    id: string;
    email: string;
    name: string;
    // Add any other user properties you need
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AuthProviderProps {
    children: ReactNode;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    


    // Context value
    const value = {
        user,
        setUser,
        token,
        setToken,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
