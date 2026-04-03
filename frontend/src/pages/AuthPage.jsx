import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin
    ? <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
    : <SignupForm onSwitchToLogin={() => setShowLogin(true)} />;
}