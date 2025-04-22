import type { CompanyDocument } from '../../models/company.model';
import type { Types } from 'mongoose';

export interface ICompanyRepository {
  create(companyData: Partial<CompanyDocument>): Promise<CompanyDocument>;
  findById(id: string): Promise<CompanyDocument | null>;
  findAll(): Promise<CompanyDocument[]>;
  update(id: string, companyData: Partial<CompanyDocument>): Promise<CompanyDocument | null>;
  delete(id: string): Promise<boolean>;
  addFollower(companyId: string, userId: Types.ObjectId): Promise<CompanyDocument | null>;
  removeFollower(companyId: string, userId: Types.ObjectId): Promise<CompanyDocument | null>;
  findByIndustryType(industryType: string): Promise<CompanyDocument[]>;
  searchCompanies(query: string): Promise<CompanyDocument[]>;
  findByCompanyName(companyName: string): Promise<CompanyDocument | null>;
  findOne(query: any): Promise<CompanyDocument | null>;
  findByCompanyId(companyId: string): Promise<CompanyDocument | null>;
} 