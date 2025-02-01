import type { Document } from "mongoose";

export default interface IOtp extends Document {
  userId: string
  email: string;
  otp: string;
  createdAt: Date;
  used: boolean
}
