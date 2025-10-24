import { AuthRepository } from '../repositories/AuthRepository';
import { CompanyRepository } from '../repositories/CompanyRepository';
import { UserRepository } from '../repositories/UserRepository';

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'individual' | 'company';
  companyName?: string;
  cnpj?: string;
}

/**
 * Sign Up Use Case
 * Single Responsibility: Handle user registration logic
 */
export class SignUpUseCase {
  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
    private companyRepository: CompanyRepository
  ) {}

  async execute(userData: SignUpData) {
    // Validation
    this._validateUserData(userData);

    // Additional validation for company users
    if (userData.userType === 'company') {
      this._validateCompanyData(userData);
    }

    try {
      const session = await this.authRepository.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          data: {
            user_type: userData.userType,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          },
        },
      });

      return {
        success: true,
        session,
        message:
          userData.userType === 'company'
            ? 'Conta da empresa criada com sucesso! Verifique seu e-mail.'
            : 'Conta criada com sucesso! Verifique seu e-mail.',
      };
    } catch (error: unknown) {
      // Handle specific Supabase errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('User already registered')) {
        throw new Error('Este e-mail já está cadastrado');
      }

      if (errorMessage.includes('Password should be at least')) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      throw error;
    }
  }

  private _validateUserData(userData: SignUpData) {
    const { email, password, confirmPassword, firstName, lastName, userType } = userData;

    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (password !== confirmPassword) {
      throw new Error('Senhas não coincidem');
    }

    if (!firstName || !firstName.trim()) {
      throw new Error('Nome é obrigatório');
    }

    if (!lastName || !lastName.trim()) {
      throw new Error('Sobrenome é obrigatório');
    }

    if (!userType || !['individual', 'company'].includes(userType)) {
      throw new Error('Tipo de usuário inválido');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de e-mail inválido');
    }
  }

  private _validateCompanyData(userData: SignUpData) {
    const { companyName, cnpj } = userData;

    if (!companyName || !companyName.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }

    if (!cnpj || !cnpj.trim()) {
      throw new Error('CNPJ é obrigatório');
    }

    // Basic CNPJ validation
    const cnpjNumbers = cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }
  }
}
