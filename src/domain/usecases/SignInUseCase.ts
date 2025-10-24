import { AuthRepository } from '../repositories/AuthRepository';

/**
 * Sign In Use Case
 * Single Responsibility: Handle user sign in logic
 */
export class SignInUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string) {
    // Validation
    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de e-mail inválido');
    }

    try {
      const session = await this.authRepository.signIn(email.toLowerCase().trim(), password);

      if (!session || !session.isValid) {
        throw new Error('Credenciais inválidas');
      }

      return {
        success: true,
        session,
        message: 'Login realizado com sucesso',
      };
    } catch (error: unknown) {
      // Handle specific Supabase errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos');
      }

      if (errorMessage.includes('Email not confirmed')) {
        throw new Error('Confirme seu e-mail antes de fazer login');
      }

      throw error;
    }
  }
}
