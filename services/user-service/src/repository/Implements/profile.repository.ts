import { Profile, type ProfileDocument } from '../../models/profile.model';
import type { IProfileRepository } from '../interface/IProfileRepository';

export class ProfileRepository implements IProfileRepository {
  async create(profile: Partial<ProfileDocument>): Promise<ProfileDocument> {
    const newProfile = new Profile(profile);
    return await newProfile.save();
  }

  async findById(id: string): Promise<ProfileDocument | null> {
    return await Profile.findById(id);
  }

  async update(id: string, profile: Partial<ProfileDocument>): Promise<ProfileDocument | null> {
    return await Profile.findByIdAndUpdate(id, profile, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Profile.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(): Promise<ProfileDocument[]> {
    return await Profile.find();
  }

  async findByUserId(userId: string): Promise<ProfileDocument | null> {
    return await Profile.findOne({ userId });
  }
} 