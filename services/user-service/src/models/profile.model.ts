import { Schema, model, Document } from 'mongoose';

interface Experience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  currentlyWorking: boolean;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

interface Preference {
  city: string;
  salary: number;
  jobRole: string;
}

export interface ProfileDocument extends Document {
  isExperience: boolean;
  experiences: Experience[];
  educations: Education[];
  education: string[];
  resume?: string;
  preference?: Preference;
  skills: string[];
  tags: string[];
  gender?: string;
  age?: number;
  dob?: string;
  country?: string;
}

const ExperienceSchema = new Schema<Experience>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    currentlyWorking: { type: Boolean, required: true },
    description: { type: String },
  },
  { _id: false }
);

const EducationSchema = new Schema<Education>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    grade: { type: String },
  },
  { _id: false }
);

const PreferenceSchema = new Schema<Preference>(
  {
    city: { type: String, required: true },
    salary: { type: Number, required: true },
    jobRole: { type: String, required: true },
  },
  { _id: false }
);

const ProfileSchema = new Schema<ProfileDocument>(
  {
    isExperience: { type: Boolean, required: true },
    experiences: { type: [ExperienceSchema], default: [] },
    education: { type: [String], default: [] },
    educations: { type: [EducationSchema], default: [] },
    resume: { type: String },
    preference: { type: PreferenceSchema },
    skills: { type: [String], required: true },
    gender: { type: String },
    age: { type: Number },
    dob: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

export const Profile = model<ProfileDocument>('Profile', ProfileSchema);
