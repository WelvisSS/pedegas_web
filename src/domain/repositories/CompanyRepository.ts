import { Company } from '../entities/Company';

/**
 * Company Repository Interface
 * Following Dependency Inversion Principle (SOLID)
 */
export abstract class CompanyRepository {
  abstract getById(companyId: string): Promise<Company | null>;
  abstract create(company: Company): Promise<Company>;
  abstract update(companyId: string, updates: Partial<Company>): Promise<Company>;
  abstract getByCnpj(cnpj: string): Promise<Company | null>;
  abstract getByEmail(email: string): Promise<Company | null>;
}
