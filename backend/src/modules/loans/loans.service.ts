import { pool } from "../../db";
import { HttpError } from "../../middleware/error";
import { CreateLoanInput } from "./loans.schema";

const COLS = `id, friend_name, amount::float8 AS amount, due_date::text AS due_date,
  repaid_at, (repaid_at IS NOT NULL) AS repaid,
  (repaid_at IS NULL AND due_date < CURRENT_DATE) AS overdue,
  CASE WHEN receipt_path IS NULL THEN NULL ELSE '/uploads/' || receipt_path END AS receipt_url,
  created_at`;

export async function addLoan(userId: number, d: CreateLoanInput, receiptFile?: string) {
  const { rows } = await pool.query(
    `INSERT INTO loans (user_id, friend_name, amount, due_date, receipt_path)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLS}`,
    [userId, d.friendName, d.amount, d.dueDate, receiptFile ?? null]
  );
  return rows[0];
}

export async function listLoans(userId: number) {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM loans WHERE user_id = $1
     ORDER BY (repaid_at IS NULL) DESC, due_date ASC, id ASC`,
    [userId]
  );
  return rows;
}

export async function markRepaid(userId: number, loanId: number) {
  const { rows } = await pool.query(
    `UPDATE loans SET repaid_at = COALESCE(repaid_at, now())
     WHERE id = $1 AND user_id = $2 RETURNING ${COLS}`,
    [loanId, userId]
  );
  if (!rows[0]) throw new HttpError(404, "Loan not found");
  return rows[0];
}

export async function getSummary(userId: number) {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(SUM(amount), 0)::float8 AS total_lent,
       COALESCE(SUM(amount) FILTER (WHERE repaid_at IS NOT NULL), 0)::float8 AS total_repaid,
       COALESCE(SUM(amount) FILTER (WHERE repaid_at IS NULL AND due_date < CURRENT_DATE), 0)::float8 AS overdue_amount
     FROM loans WHERE user_id = $1`,
    [userId]
  );
  const r = rows[0];
  return { totalLent: r.total_lent, totalRepaid: r.total_repaid, overdueAmount: r.overdue_amount };
}
