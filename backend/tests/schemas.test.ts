import assert from "node:assert/strict";
import { test } from "node:test";
import { requestOtpSchema, verifyOtpSchema } from "../src/modules/auth/auth.schema";
import { createLoanSchema } from "../src/modules/loans/loans.schema";

test("phone: accepts valid, rejects invalid", () => {
  assert.ok(requestOtpSchema.safeParse({ phone: "9876543210" }).success);
  assert.ok(requestOtpSchema.safeParse({ phone: "+919876543210" }).success);
  assert.ok(!requestOtpSchema.safeParse({ phone: "12345" }).success);
  assert.ok(!requestOtpSchema.safeParse({ phone: "abcdefghij" }).success);
});

test("otp must be 6 digits", () => {
  assert.ok(verifyOtpSchema.safeParse({ phone: "9876543210", otp: "123456" }).success);
  assert.ok(!verifyOtpSchema.safeParse({ phone: "9876543210", otp: "12345" }).success);
  assert.ok(!verifyOtpSchema.safeParse({ phone: "9876543210", otp: "12345a" }).success);
});

test("loan: valid input, string amount is coerced", () => {
  const r = createLoanSchema.safeParse({ friendName: " Rahul ", amount: "500", dueDate: "2026-11-30" });
  assert.ok(r.success);
  if (r.success) {
    assert.equal(r.data.friendName, "Rahul");
    assert.equal(r.data.amount, 500);
  }
});

test("loan: rejects bad name, amount, date", () => {
  const base = { friendName: "A", amount: 10, dueDate: "2026-11-30" };
  assert.ok(!createLoanSchema.safeParse({ ...base, friendName: "  " }).success);
  assert.ok(!createLoanSchema.safeParse({ ...base, amount: 0 }).success);
  assert.ok(!createLoanSchema.safeParse({ ...base, amount: -5 }).success);
  assert.ok(!createLoanSchema.safeParse({ ...base, dueDate: "30-11-2026" }).success);
  assert.ok(!createLoanSchema.safeParse({ ...base, dueDate: "2026-02-31" }).success);
});
