import type { User, UserData } from '../entities/User';

/**
 * User Repository Interface
 * Following Dependency Inversion Principle (SOLID)
 */
export abstract class UserRepository {
  abstract getById(userId: string): Promise<User | null>;
  abstract create(user: UserData): Promise<User>;
  abstract update(userId: string, updates: Partial<UserData>): Promise<User>;
  abstract delete(userId: string): Promise<void>;
}
