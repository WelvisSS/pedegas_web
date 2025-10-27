import { useState, type ChangeEvent, type FormEvent } from 'react';
import { validateEmail } from '../../../utils/validators';
import { useAuth } from '../../hooks';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

/**
 * Forgot Password Form Component
 * Following Single Responsibility Principle
 */
interface ForgotPasswordFormProps {
  onToggleForm: (formType: 'signin' | 'signup' | 'forgot') => void;
}

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

const ForgotPasswordForm = ({ onToggleForm }: ForgotPasswordFormProps) => {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message,
        });
        setEmail(''); // Clear form on success
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar e-mail de recuperação',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Recuperar Senha</h2>
        <p className="text-secondary-600 mt-2">
          Digite seu e-mail para receber as instruções de recuperação
        </p>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={handleInputChange}
          error={error}
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Enviar Instruções
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={() => onToggleForm('signin')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Voltar para login
        </button>

        <p className="text-secondary-600">
          Não tem uma conta?{' '}
          <button
            onClick={() => onToggleForm('signup')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </Card>
  );
};

export default ForgotPasswordForm;
