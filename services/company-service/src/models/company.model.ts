import { Schema, model, Document, Types } from 'mongoose';
import { SubscriptionType } from '../types/subscription.type';
import type { ObjectId } from 'mongoose';

interface CompanyAddress {
    country: string;
    city: string;
    pincode: number;
    address: string;
}

export interface CompanyDocument extends Document {
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
    plan?: SubscriptionType;
    subscription?: {
        stripeSessionId: string;
        subscriptionId: ObjectId;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
        customerId: string;
    };

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
        companyName: { type: String, unique: true },
        companyWebsite: { type: String, unique: true },
        companyDescription: { type: String },
        industryType: { type: [String], default: [] },
        companyLogo: { type: String },
        companyAddress: { type: CompanyAddressSchema },
        numberOfEmployees: { type: Number, default: 0 },
        description: { type: String },
        plan: { type: String, enum: Object.values(SubscriptionType) },
        rating: { type: Number, default: 0 },
        followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
        subscription: {
            stripeSessionId: { type: String, default: null },
            subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', default: null },
            startDate: { type: Date, default: null },
            endDate: { type: Date, default: null },
            isActive: { type: Boolean, default: false },
            customerId: { type: String, default: null },
        },

    },
    { timestamps: true }
);

export const Company = model<CompanyDocument>('Company', CompanySchema);
