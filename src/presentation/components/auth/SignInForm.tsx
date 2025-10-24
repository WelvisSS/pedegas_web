import { useState } from 'react';
import { validateEmail, validatePassword } from '../../../utils/validators';
import { useAuth } from '../../hooks';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

/**
 * Sign In Form Component
 * Following Single Responsibility Principle
 */
interface SignInFormProps {
  onToggleForm: (formType: 'signin' | 'signup' | 'forgot') => void;
  onForgotPassword: () => void;
}

interface FormErrors {
  email?: string | null;
  password?: string | null;
}

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

const SignInForm = ({ onToggleForm, onForgotPassword }: SignInFormProps) => {
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message,
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Entrar na Conta</h2>
        <p className="text-secondary-600 mt-2">Acesse sua conta para continuar</p>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />

        <Input
          label="Senha"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
          autoComplete="current-password"
          placeholder="Sua senha"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>

      <div className="mt-6 text-center">
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

export default SignInForm;
