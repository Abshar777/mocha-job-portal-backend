import { Schema, model } from 'mongoose';
import bcrypt from "bcryptjs"
import type IOtp from '../types/interface/IOtp';
import type { OtpDocument } from '../types/interface/IOtp';
const otpSchema = new Schema<OtpDocument>(
    {
        userId: { type: String, required: true, ref: "User" },
        email: { type: String, required: true, unique: true },
        otp: { type: String, required: true },
        used: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now, expires: 60 }, 
    },
    { timestamps: true }
);


otpSchema.pre<OtpDocument>("save", async function (next) {
    if (!this.isModified("otp")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});


otpSchema.methods.verifyOtp = function (otp: string) {
    return bcrypt.compareSync(otp, this.otp);
}

const OtpModel = model<OtpDocument>('Otp', otpSchema);



export default OtpModel;
