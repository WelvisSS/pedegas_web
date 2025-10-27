import { useState, type ChangeEvent, type FormEvent } from 'react';
import { USER_TYPES } from '../../../constants/userTypes';
import type { UserType } from '../../../constants/userTypes';
import {
  formatCnpj,
  formatPhone,
  validateCnpj,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../../utils/validators';
import { useAuth } from '../../hooks';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import UserTypeToggle from './UserTypeToggle';

/**
 * Sign Up Form Component
 * Following Single Responsibility Principle
 */
interface SignUpFormProps {
  onToggleForm: (formType: 'signin' | 'signup' | 'forgot') => void;
}

interface FormData {
  userType: UserType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  cnpj: string;
}

interface FormErrors {
  [key: string]: string | null;
}

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

const SignUpForm = ({ onToggleForm }: SignUpFormProps) => {
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    userType: USER_TYPES.INDIVIDUAL,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    cnpj: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [alert, setAlert] = useState<AlertState | null>(null);

  const handleInputChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Format specific fields
    if (field === 'cnpj') {
      value = formatCnpj(value);
    } else if (field === 'phone') {
      value = formatPhone(value);
    }

    setFormData((prev: FormData) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: null }));
    }
  };

  const handleUserTypeChange = (userType: UserType) => {
    setFormData((prev: FormData) => ({ ...prev, userType }));
    // Clear company-specific errors when switching to individual
    if (userType === USER_TYPES.INDIVIDUAL) {
      setErrors((prev: FormErrors) => {
        const { companyName: _companyName, cnpj: _cnpj, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Common validations
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    const firstNameError = validateName(formData.firstName, 'Nome');
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, 'Sobrenome');
    if (lastNameError) newErrors.lastName = lastNameError;

    // Optional phone validation
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Company-specific validations
    if (formData.userType === USER_TYPES.COMPANY) {
      const companyNameError = validateName(formData.companyName, 'Nome da empresa');
      if (companyNameError) newErrors.companyName = companyNameError;

      const cnpjError = validateCnpj(formData.cnpj);
      if (cnpjError) newErrors.cnpj = cnpjError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signUp(formData);

      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message,
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao criar conta',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Criar Conta</h2>
        <p className="text-secondary-600 mt-2">Preencha os dados para se cadastrar</p>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <UserTypeToggle value={formData.userType} onChange={handleUserTypeChange} />

        {formData.userType === USER_TYPES.COMPANY && (
          <>
            <Input
              label="Nome da Empresa"
              type="text"
              value={formData.companyName}
              onChange={handleInputChange('companyName')}
              error={errors.companyName}
              required
              placeholder="Nome da sua empresa"
            />

            <Input
              label="CNPJ"
              type="text"
              value={formData.cnpj}
              onChange={handleInputChange('cnpj')}
              error={errors.cnpj}
              required
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nome"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={errors.firstName}
            required
            placeholder="Seu nome"
          />

          <Input
            label="Sobrenome"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={errors.lastName}
            required
            placeholder="Seu sobrenome"
          />
        </div>

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
          label="Telefone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          error={errors.phone}
          placeholder="(11) 99999-9999"
          helperText="Opcional"
        />

        <Input
          label="Senha"
          type="password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={errors.password}
          required
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />

        <Input
          label="Confirmar Senha"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Criar Conta
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          Já tem uma conta?{' '}
          <button
            onClick={() => onToggleForm('signin')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Faça login
          </button>
        </p>
      </div>
    </Card>
  );
};

export default SignUpForm;
