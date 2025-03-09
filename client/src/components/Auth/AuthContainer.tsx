import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export interface AuthResponse {
  accessToken: string;
}

export interface AuthContainerProps {
  onAuthSuccess: (accessToken: string) => void;
}


const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);


  const switchToRegister = (): void => {
    setIsLogin(false);
  };

  const switchToLogin = (): void => {
    setIsLogin(true);
  };

  return isLogin ? (
    <LoginForm
      // onSubmit={handleLoginSubmit}
      onAuthSuccess={onAuthSuccess}
      switchToRegister={switchToRegister}
    />
  ) : (
    <RegisterForm
      onAuthSuccess={onAuthSuccess}
      switchToLogin={switchToLogin}
    />
  )

};

export default AuthContainer;