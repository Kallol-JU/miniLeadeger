export const isValidPhone = (p: string) => /^\+?[0-9]{10,15}$/.test(p);
export const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s);
export const money = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
