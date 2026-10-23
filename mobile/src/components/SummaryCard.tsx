import { StyleSheet, Text, View } from "react-native";
import { Summary } from "../api";
import { money } from "../validation";

const Item = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={s.item}>
    <Text style={s.label}>{label}</Text>
    <Text style={[s.value, { color }]}>{money(value)}</Text>
  </View>
);

export default function SummaryCard({ summary }: { summary: Summary | null }) {
  const v = summary ?? { totalLent: 0, totalRepaid: 0, overdueAmount: 0 };
  return (
    <View style={s.card}>
      <Item label="Total lent" value={v.totalLent} color="#111" />
      <Item label="Repaid" value={v.totalRepaid} color="#16a34a" />
      <Item label="Overdue" value={v.overdueAmount} color="#dc2626" />
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2, shadowOpacity: 0.08, shadowRadius: 6 },
  item: { flex: 1, alignItems: "center" },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },
  value: { fontSize: 18, fontWeight: "700" },
});
