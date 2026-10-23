import { Router } from "express";
import { wrap } from "../../middleware/error";
import { requestOtpSchema, verifyOtpSchema } from "./auth.schema";
import * as service from "./auth.service";

export const authRouter = Router();

authRouter.post("/request-otp", wrap(async (req, res) => {
  const { phone } = requestOtpSchema.parse(req.body);
  await service.requestOtp(phone);
  res.json({ message: "OTP sent (check server log)" });
}));

authRouter.post("/verify-otp", wrap(async (req, res) => {
  const { phone, otp } = verifyOtpSchema.parse(req.body);
  res.json(await service.verifyOtp(phone, otp));
}));
