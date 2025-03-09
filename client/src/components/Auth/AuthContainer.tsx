import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../hooks/useAuth';

export interface AuthResponse {
  accessToken: string;
}

export interface AuthContainerProps {
  onAuthSuccess: (accessToken: string) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { login, register } = useAuth();

  const handleLoginSubmit = async (userId: string, password: string) => {
    try {
      await login(userId, password);
      const token = localStorage.getItem('authToken');
      if (token) {
        onAuthSuccess(token);
      }
    } catch (error) {
      // Error is handled in the AuthProvider
      console.error('Login failed:', error);
    }
  };

  const handleRegisterSubmit = async (registerData: any) => {
    try {
      await register(registerData);
      const token = localStorage.getItem('authToken');
      if (token) {
        onAuthSuccess(token);
      }
    } catch (error) {
      // Error is handled in the AuthProvider
      console.error('Registration failed:', error);
    }
  };

  const switchToRegister = (): void => {
    setIsLogin(false);
  };

  const switchToLogin = (): void => {
    setIsLogin(true);
  };

  return isLogin ? (
    <LoginForm
      onSubmit={handleLoginSubmit}
      onAuthSuccess={onAuthSuccess}
      switchToRegister={switchToRegister}
    />
  ) : (
    <RegisterForm
      onSubmit={handleRegisterSubmit}
      onAuthSuccess={onAuthSuccess}
      switchToLogin={switchToLogin}
    />
  );
};

export default AuthContainer;