import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../../db";
import { config } from "../../config";
import { HttpError } from "../../middleware/error";

const MAX_ATTEMPTS = 5;
const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function requestOtp(phone: string) {
  const code = crypto.randomInt(100000, 1000000).toString();
  await pool.query(
    `INSERT INTO otps (phone, code_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [phone, hash(code), config.otpTtlMinutes]
  );
  // MOCK OTP: "sent" by printing to the server log
  console.log(`[MOCK OTP] ${phone} -> ${code}`);
}

export async function verifyOtp(phone: string, code: string) {
  const { rows } = await pool.query(
    `SELECT id, code_hash, attempts FROM otps
     WHERE phone = $1 AND used = false AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );
  const otp = rows[0];
  if (!otp) throw new HttpError(400, "OTP expired or not requested");
  if (otp.attempts >= MAX_ATTEMPTS) throw new HttpError(429, "Too many attempts, request a new OTP");

  if (otp.code_hash !== hash(code)) {
    await pool.query("UPDATE otps SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
    throw new HttpError(400, "Incorrect OTP");
  }
  await pool.query("UPDATE otps SET used = true WHERE id = $1", [otp.id]);

  const user = await pool.query(
    `INSERT INTO users (phone) VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
     RETURNING id, phone`,
    [phone]
  );
  const token = jwt.sign({ sub: String(user.rows[0].id) }, config.jwtSecret, { expiresIn: "7d" });
  return { token, user: user.rows[0] };
}
