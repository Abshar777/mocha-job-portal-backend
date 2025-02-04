import { z } from "zod";

export const passwordValidationSchemas = {
    forgotPassword: z.object({
        body: z.object({
            email: z.string({
                required_error: "Email is required",
            }).email("Invalid email format"),
        })
    }),

    resetPassword: z.object({
        body: z.object({
            email: z.string({
                required_error: "Email is required",
            }).email("Invalid email format"),
            otp: z.string({
                required_error: "OTP is required",
            }).length(6, "OTP must be exactly 6 characters"),
            newPassword: z.string({
                required_error: "New password is required",
            }).min(6, "Password must be at least 6 characters"),
        })
    }),

    changePassword: z.object({
        body: z.object({
            currentPassword: z.string({
                required_error: "Current password is required",
            }),
            newPassword: z.string({
                required_error: "New password is required",
            }).min(6, "Password must be at least 6 characters"),
        })
    })
};