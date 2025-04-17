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
            newPassword: z.string({
                required_error: "New password is required",
            }).min(6, "Password must be at least 6 characters"),
        })
    }),

    changePassword: z.object({
        body: z.object({
            email: z.string({
                required_error: "Email is required",
            }).email("Invalid email format"),
            newPassword: z.string({
                required_error: "New password is required",
            }).min(6, "Password must be at least 6 characters"),
        })
    })
};