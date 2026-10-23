import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error";
import { authRouter } from "./modules/auth/auth.routes";
import { loansRouter, UPLOAD_DIR } from "./modules/loans/loans.routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/loans", loansRouter);
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(errorHandler);
