import { Company, type CompanyDocument } from '../../models/company.model';
import type { ICompanyRepository } from '../interface/ICompanyRepo';
import { Types } from 'mongoose';

export class CompanyRepository implements ICompanyRepository {
  async create(companyData: Partial<CompanyDocument>): Promise<CompanyDocument> {
    const company = new Company(companyData);
    return await company.save();
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return await Company.findById(id);
  }

  async findAll(): Promise<CompanyDocument[]> {
    return await Company.find();
  }

  async findOne(query: any): Promise<CompanyDocument | null> {
    return await Company.findOne(query);
  }

  async findByCompanyId(companyId: string): Promise<CompanyDocument | null> {
    return await Company.findOne({ companyId });
  }

  async update(id: string, companyData: Partial<CompanyDocument>): Promise<CompanyDocument | null> {
    return await Company.findByIdAndUpdate(id, companyData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Company.findByIdAndDelete(id);
    return result !== null;
  }

  async addFollower(companyId: string, userId: Types.ObjectId): Promise<CompanyDocument | null> {
    return await Company.findByIdAndUpdate(
      companyId,
      { $addToSet: { followers: userId } },
      { new: true }
    );
  }

  async removeFollower(companyId: string, userId: Types.ObjectId): Promise<CompanyDocument | null> {
    return await Company.findByIdAndUpdate(
      companyId,
      { $pull: { followers: userId } },
      { new: true }
    );
  }

  async findByIndustryType(industryType: string): Promise<CompanyDocument[]> {
    return await Company.find({ industryType: { $in: [industryType] } });
  }

  async findByCompanyName(companyName: string): Promise<CompanyDocument | null> {
    return await Company.findOne({ companyName });
  }

  

  async searchCompanies(query: string): Promise<CompanyDocument[]> {
    return await Company.find({
      $or: [
        { companyName: { $regex: query, $options: 'i' } },
        { companyDescription: { $regex: query, $options: 'i' } },
        { 'companyAddress.city': { $regex: query, $options: 'i' } },
        { 'companyAddress.country': { $regex: query, $options: 'i' } }
      ]
    });
  }
} 