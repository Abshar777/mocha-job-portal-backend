import type { NextFunction, Request } from "express";
import type { Response } from "express";
import { z } from "zod";


export const otpVerifySchema = z.object({
    body: z.object({
        otp: z.string({
            required_error: "OTP is required",
        }).length(4, "OTP must be exactly 4 characters")
            .regex(/^\d+$/, "OTP must contain only numbers"),
    })
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: "Email is required",
        }).email("Invalid email format"),
    })
});


export const checkOtpStatusSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: "Email is required",
        }).email("Invalid email format")
    })
});








