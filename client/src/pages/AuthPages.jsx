import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export const AuthPage = () => {
  return (
    <AuthLayout>
      <div className="w-full">
        <LoginForm />
        <p className="text-body text-text-muted text-sm mt-8 text-center">
          Your mobile number is used only for this local account session.
        </p>
      </div>
    </AuthLayout>
  );
};
