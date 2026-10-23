import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { api, Loan, Summary } from "../api";
import AddLoanForm from "../components/AddLoanForm";
import LoanItem from "../components/LoanItem";
import SummaryCard from "../components/SummaryCard";

export default function LoansScreen({ onLogout }: { onLogout: () => void }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [l, s] = await Promise.all([api.loans(), api.summary()]);
      setLoans(l); setSummary(s);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const repay = async (id: number) => {
    try { await api.repay(id); load(); } catch (e: any) { Alert.alert("Error", e.message); }
  };

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.title}>MiniLedger</Text>
        <Pressable onPress={onLogout}><Text style={s.logout}>Logout</Text></Pressable>
      </View>
      <FlatList
        data={loans}
        keyExtractor={(l) => String(l.id)}
        ListHeaderComponent={<SummaryCard summary={summary} />}
        renderItem={({ item }) => <LoanItem loan={item} onRepay={repay} />}
        ListEmptyComponent={<Text style={s.empty}>No entries yet. Tap + to add one.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />
      <Pressable style={s.fab} onPress={() => setShowForm(true)}><Text style={s.fabText}>+</Text></Pressable>
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={s.backdrop}>
          <AddLoanForm onCancel={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} />
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f1f5f9", paddingTop: 48 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800" },
  logout: { color: "#dc2626", fontWeight: "600" },
  empty: { textAlign: "center", color: "#666", marginTop: 40 },
  fab: { position: "absolute", right: 20, bottom: 30, width: 58, height: 58, borderRadius: 29, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", elevation: 4 },
  fabText: { color: "#fff", fontSize: 30, marginTop: -2 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
});
