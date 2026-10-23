import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { API_URL, Loan } from "../api";
import { money } from "../validation";

export default function LoanItem({ loan, onRepay }: { loan: Loan; onRepay: (id: number) => void }) {
  return (
    <View style={[s.card, loan.overdue && s.overdue, loan.repaid && s.repaid]}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{loan.friend_name}</Text>
        <Text style={s.sub}>Due {loan.due_date}{loan.overdue ? "  •  OVERDUE" : ""}{loan.repaid ? "  •  Repaid" : ""}</Text>
        <Text style={s.amount}>{money(loan.amount)}</Text>
        {!loan.repaid && (
          <Pressable style={s.btn} onPress={() => onRepay(loan.id)}>
            <Text style={s.btnText}>Mark repaid</Text>
          </Pressable>
        )}
      </View>
      {loan.receipt_url && <Image source={{ uri: API_URL + loan.receipt_url }} style={s.thumb} />}
    </View>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: "#cbd5e1" },
  overdue: { backgroundColor: "#fef2f2", borderLeftColor: "#dc2626" },
  repaid: { opacity: 0.6, borderLeftColor: "#16a34a" },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12, color: "#666", marginVertical: 2 },
  amount: { fontSize: 18, fontWeight: "600", marginTop: 2 },
  btn: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "#2563eb", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  thumb: { width: 56, height: 56, borderRadius: 8, marginLeft: 10 },
});
