import { SupabaseClient } from '@supabase/supabase-js';
import { Company } from '../../domain/entities/Company';
import { CompanyRepository } from '../../domain/repositories/CompanyRepository';

/**
 * Supabase implementation of CompanyRepository
 * Following Dependency Inversion Principle
 */
export class SupabaseCompanyRepository extends CompanyRepository {
  constructor(private supabase: SupabaseClient) {
    super();
  }

  async getById(companyId: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return Company.fromJson(data);
  }

  async create(company: Company): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert(company.toJson())
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Company.fromJson(data);
  }

  async update(companyId: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Company.fromJson(data);
  }

  async getByCnpj(cnpj: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('cnpj', cnpj)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return Company.fromJson(data);
  }

  async getByEmail(email: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(error.message);
    }

    return Company.fromJson(data);
  }
}
