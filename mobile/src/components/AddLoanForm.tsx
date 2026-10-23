import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../api";
import { isValidDate } from "../validation";

export default function AddLoanForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [receiptUri, setReceiptUri] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pick = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission needed");
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6 };
    const r = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!r.canceled) setReceiptUri(r.assets[0].uri);
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!friendName.trim()) e.friendName = "Enter friend's name";
    if (!(Number(amount) > 0)) e.amount = "Enter an amount greater than 0";
    if (!isValidDate(dueDate)) e.dueDate = "Use YYYY-MM-DD (e.g. 2026-12-31)";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await api.addLoan({ friendName: friendName.trim(), amount, dueDate, receiptUri });
      onDone();
    } catch (err: any) {
      Alert.alert("Could not save", err.message);
    } finally { setBusy(false); }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>New loan</Text>
      <TextInput style={s.input} placeholder="Friend name" value={friendName} onChangeText={setFriendName} />
      {errors.friendName && <Text style={s.err}>{errors.friendName}</Text>}
      <TextInput style={s.input} placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
      {errors.amount && <Text style={s.err}>{errors.amount}</Text>}
      <TextInput style={s.input} placeholder="Due date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} autoCapitalize="none" />
      {errors.dueDate && <Text style={s.err}>{errors.dueDate}</Text>}

      <View style={s.row}>
        <Pressable style={s.ghost} onPress={() => pick(true)}><Text>📷 Camera</Text></Pressable>
        <Pressable style={s.ghost} onPress={() => pick(false)}><Text>🖼 Gallery</Text></Pressable>
      </View>
      {receiptUri && <Image source={{ uri: receiptUri }} style={s.preview} />}

      <View style={s.row}>
        <Pressable style={[s.ghost, { flex: 1 }]} onPress={onCancel}><Text>Cancel</Text></Pressable>
        <Pressable style={[s.primary, { flex: 1 }]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Save</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, marginTop: 8 },
  err: { color: "#dc2626", fontSize: 12, marginTop: 2 },
  row: { flexDirection: "row", gap: 10, marginTop: 12 },
  ghost: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#d1d5db", alignItems: "center" },
  primary: { padding: 12, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700" },
  preview: { width: 100, height: 100, borderRadius: 10, marginTop: 10 },
});
