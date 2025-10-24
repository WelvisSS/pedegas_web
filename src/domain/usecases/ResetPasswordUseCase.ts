import { AuthRepository } from '../repositories/AuthRepository';

/**
 * Reset Password Use Case
 * Single Responsibility: Handle password reset logic
 */
export class ResetPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string) {
    // Validation
    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de e-mail inválido');
    }

    try {
      await this.authRepository.resetPassword(email.toLowerCase().trim());

      return {
        success: true,
        message: 'Instruções para redefinir sua senha foram enviadas para seu e-mail',
      };
    } catch (error: unknown) {
      // Handle specific Supabase errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Unable to validate email address')) {
        throw new Error('E-mail não encontrado em nossa base de dados');
      }

      throw error;
    }
  }
}
