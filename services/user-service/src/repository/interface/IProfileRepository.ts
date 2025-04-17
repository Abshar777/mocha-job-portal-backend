import type { ProfileDocument } from '../../models/profile.model';

export interface IProfileRepository {
  create(profile: Partial<ProfileDocument>): Promise<ProfileDocument>;
  findById(id: string): Promise<ProfileDocument | null>;
  update(id: string, profile: Partial<ProfileDocument>): Promise<ProfileDocument | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<ProfileDocument[]>;
  findByUserId(userId: string): Promise<ProfileDocument | null>;
} 