import mongoose, { Schema } from "mongoose";
import type { ObjectId, Document } from "mongoose";

interface IJobPosting extends Document {
    title: string;
    description: string;
    companyId: ObjectId;
    companySubscriptionId: ObjectId;
    locations: string[];
    expiryDate: Date;
    isActive: boolean;
    applicantCount: number;
    maxApplicants: number | null;
    createdAt: Date;
    updatedAt: Date;
}

const JobPostingSchema = new Schema<IJobPosting>(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        },
        companySubscriptionId: {
            type: Schema.Types.ObjectId,
            ref: 'CompanySubscription',
            required: true
        },
        locations: [{
            type: String,
            required: true
        }],
        expiryDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        applicantCount: {
            type: Number,
            default: 0
        },
        maxApplicants: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const JobPosting = mongoose.model<IJobPosting>('JobPosting', JobPostingSchema);
