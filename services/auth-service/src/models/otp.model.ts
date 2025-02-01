import { Schema, model, Document } from 'mongoose';
import type IOtp from '../types/interface/IOtp';
const otpSchema = new Schema<IOtp>(
    {
        userId:{type:String,required:true,ref:"User"},
        email: { type: String, required: true, unique: true },
        otp: { type: String, required: true },
        used: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now, expires: 60 }, // Auto delete after 1 min
    },
    { timestamps: true }
);

const OtpModel = model<IOtp>('Otp', otpSchema);

export default OtpModel;
