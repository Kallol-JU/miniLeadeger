import { Platform } from "react-native";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

export type Loan = {
  id: number; friend_name: string; amount: number; due_date: string;
  repaid: boolean; overdue: boolean; receipt_url: string | null;
};
export type Summary = { totalLent: number; totalRepaid: number; overdueAmount: number };

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };
let onUnauthorized: () => void = () => {};
export const setOnUnauthorized = (fn: () => void) => { onUnauthorized = fn; };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (typeof init.body === "string") headers["Content-Type"] = "application/json";

  let res: Response;
  try { res = await fetch(API_URL + path, { ...init, headers }); }
  catch { throw new Error(`Cannot reach server at ${API_URL}`); }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) {
    const details = data.details ? Object.values(data.details).flat().join(", ") : "";
    throw new Error(details || data.error || "Request failed");
  }
  return data as T;
}

export const api = {
  requestOtp: (phone: string) => request("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string }>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  loans: () => request<Loan[]>("/loans"),
  summary: () => request<Summary>("/loans/summary"),
  repay: (id: number) => request<Loan>(`/loans/${id}/repay`, { method: "PATCH" }),
  addLoan: (f: { friendName: string; amount: string; dueDate: string; receiptUri?: string }) => {
    const form = new FormData();
    form.append("friendName", f.friendName);
    form.append("amount", f.amount);
    form.append("dueDate", f.dueDate);
    if (f.receiptUri) {
      const ext = f.receiptUri.split(".").pop()?.toLowerCase();
      const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      form.append("receipt", { uri: f.receiptUri, name: `receipt.${ext ?? "jpg"}`, type } as any);
    }
    return request<Loan>("/loans", { method: "POST", body: form });
  },
};
