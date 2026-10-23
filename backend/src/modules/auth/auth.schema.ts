import { z } from "zod";

export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number");
export const requestOtpSchema = z.object({ phone: phoneSchema });
export const verifyOtpSchema = z.object({ phone: phoneSchema, otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits") });
