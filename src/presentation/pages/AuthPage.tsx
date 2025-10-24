import { useState } from 'react';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

/**
 * Authentication Page
 * Manages form switching and layout
 * Following Single Responsibility Principle
 */
const AuthPage = () => {
  const [currentForm, setCurrentForm] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const handleToggleForm = (formType: 'signin' | 'signup' | 'forgot') => {
    setCurrentForm(formType);
  };

  const handleForgotPassword = () => {
    setCurrentForm('forgot');
  };

  const renderForm = () => {
    switch (currentForm) {
      case 'signup':
        return <SignUpForm onToggleForm={handleToggleForm} />;
      case 'forgot':
        return <ForgotPasswordForm onToggleForm={handleToggleForm} />;
      default:
        return <SignInForm onToggleForm={handleToggleForm} onForgotPassword={handleForgotPassword} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">PedeGás</h1>
          <p className="text-secondary-600 mt-2">Sistema de Gestão de Pedidos</p>
        </div>

        {/* Form Container */}
        <div className="animate-fade-in">{renderForm()}</div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-secondary-500">
          <p>&copy; 2024 PedeGás. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
