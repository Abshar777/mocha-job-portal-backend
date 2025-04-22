import type { ObjectId } from "mongoose";

export default interface IUserProfile {
  userId: ObjectId;
  address: string;
  education: {
    board?: string;
    course?: string;
    endYear?: Date;
    institution?: string;
    medium?: string;
    percentage?: string;
    qualification: string;
    startYear: Date;
    university: string;
  }[];
  experience?: {
    companyName: string;
    description: string;
    endDate: Date;
    jobTitle: string;
    startDate: Date;
  }[];
  fresher: boolean;
  preferredCity: string;
  preferredRole: string;
  profilePicture?: string;
  resume?: string;
  resumeHeadline: string;
  salary: number;
  skills: string[];
  subscription?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}