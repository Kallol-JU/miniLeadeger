import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { HttpError, wrap } from "../../middleware/error";
import { createLoanSchema } from "./loans.schema";
import * as service from "./loans.service";

export const UPLOAD_DIR = path.join(__dirname, "../../../uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new HttpError(400, "Receipt must be jpg, png or webp")),
});

export const loansRouter = Router();
loansRouter.use(requireAuth);

// Accepts JSON or multipart/form-data (with optional "receipt" image)
loansRouter.post("/", upload.single("receipt"), wrap(async (req, res) => {
  try {
    const body = createLoanSchema.parse(req.body);
    res.status(201).json(await service.addLoan(req.userId!, body, req.file?.filename));
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => {}); // don't keep orphan uploads
    throw e;
  }
}));

loansRouter.get("/", wrap(async (req, res) => res.json(await service.listLoans(req.userId!))));

loansRouter.get("/summary", wrap(async (req, res) => res.json(await service.getSummary(req.userId!))));

loansRouter.patch("/:id/repay", wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new HttpError(400, "Invalid loan id");
  res.json(await service.markRepaid(req.userId!, id));
}));
