import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { CompanyRepository } from '../../domain/repositories/CompanyRepository';
import { SignInUseCase } from '../../domain/usecases/SignInUseCase';
import { SignUpUseCase } from '../../domain/usecases/SignUpUseCase';
import type { SignUpData } from '../../domain/usecases/SignUpUseCase';
import { ResetPasswordUseCase } from '../../domain/usecases/ResetPasswordUseCase';
import type { AuthSession } from '../../domain/entities/AuthSession';

/**
 * Authentication Service
 * Orchestrates authentication use cases
 * Following Single Responsibility Principle
 */
export class AuthService {
  private signInUseCase: SignInUseCase;
  private signUpUseCase: SignUpUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;

  constructor(
    private authRepository: AuthRepository,
    userRepository: UserRepository,
    companyRepository: CompanyRepository
  ) {
    this.signInUseCase = new SignInUseCase(authRepository);
    this.signUpUseCase = new SignUpUseCase(authRepository, userRepository, companyRepository);
    this.resetPasswordUseCase = new ResetPasswordUseCase(authRepository);
  }

  async signIn(email: string, password: string) {
    return await this.signInUseCase.execute(email, password);
  }

  async signUp(userData: SignUpData) {
    return await this.signUpUseCase.execute(userData);
  }

  async signOut() {
    await this.authRepository.signOut();
    return {
      success: true,
      message: 'Logout realizado com sucesso',
    };
  }

  async resetPassword(email: string) {
    return await this.resetPasswordUseCase.execute(email);
  }

  async getCurrentSession() {
    return await this.authRepository.getCurrentSession();
  }

  async getCurrentUser() {
    const session = await this.authRepository.getCurrentSession();
    return session?.user || null;
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return this.authRepository.onAuthStateChange(callback);
  }
}
