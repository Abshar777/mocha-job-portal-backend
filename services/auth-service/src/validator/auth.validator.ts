import { z } from "zod";
import { Roles } from "../types/enums";

// Registration validation schema
export const registerSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Name is required",
        }).min(2, "Name must be at least 2 characters"),
        email: z.string({
            required_error: "Email is required",
        }).email("Invalid email format"),
        password: z.string({
            required_error: "Password is required",
        }).min(6, "Password must be at least 6 characters"),
    })
});

// Login validation schema
export const loginSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: "Email is required",
        }).email("Invalid email format"),
        password: z.string({
            required_error: "Password is required",
        }).min(6, "Password must be at least 6 characters"),
    })
});

// Role setup validation schema
export const roleSetupSchema = z.object({
    body: z.object({
        id: z.string({
            required_error: "User ID is required",
        }),
        role: z.enum([Roles.JOBSEEKER, Roles.RECRUITER], {
            errorMap: () => ({ message: "Invalid role. Must be either 'JOBSEEKER' or 'RECRUITER'" })
        })
    })
});

// Search validation schema
export const searchSchema = z.object({
    body: z.object({
        text: z.string({
            required_error: "Search text is required",
        }).min(1, "Search text cannot be empty"),
    })
});


export const validationSchemas = {
    register: registerSchema,
    login: loginSchema,
    roleSetup: roleSetupSchema,
    search: searchSchema,
};


