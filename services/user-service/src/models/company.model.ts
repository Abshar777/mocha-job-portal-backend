import { Schema, model, Document, Types } from 'mongoose';

interface CompanyAddress {
    country: string;
    city: string;
    pincode: number;
    address: string;
}

export interface CompanyDocument extends Document {
    userId: Types.ObjectId;
    companyName?: string;
    companyWebsite?: string;
    companyDescription?: string;
    industryType?: string[];
    companyLogo?: string;
    companyAddress?: CompanyAddress;
    numberOfEmployees?: number;
    description?: string;
    rating?: number;
    followers: Types.ObjectId[];
    plan?: "NON-ACTIVE" | "HOT_VACANCY" | "CLASSIFIED" | "STANDARD";
}

const CompanyAddressSchema = new Schema<CompanyAddress>(
    {
        country: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: Number, required: true },
        address: { type: String, required: true },
    },
    { _id: false }
);

const CompanySchema = new Schema<CompanyDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        companyName: { type: String, unique: true },
        companyWebsite: { type: String, unique: true },
        companyDescription: { type: String },
        industryType: { type: [String], default: [] },
        companyLogo: { type: String },
        companyAddress: { type: CompanyAddressSchema },
        numberOfEmployees: { type: Number, default: 0 },
        description: { type: String },
        plan: { type: String, default: "NON-ACTIVE", enum: ["HOT_VACANCY", "NON-ACTIVE", "CLASSIFIED", "STANDARD"] },
        rating: { type: Number, default: 0 },
        followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    },
    { timestamps: true }
);

export const Company = model<CompanyDocument>('Company', CompanySchema);
