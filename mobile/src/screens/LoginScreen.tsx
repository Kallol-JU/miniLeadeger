import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../api";
import { isValidPhone } from "../validation";

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: (token: string) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch (e: any) { Alert.alert("Error", e.message); } finally { setBusy(false); }
  };

  const sendOtp = () => {
    if (!isValidPhone(phone)) return Alert.alert("Enter a valid phone number (10–15 digits)");
    run(async () => { await api.requestOtp(phone); setOtpSent(true); Alert.alert("OTP sent", "Check the backend server log for the OTP."); });
  };
  const verify = () => {
    if (!/^\d{6}$/.test(otp)) return Alert.alert("OTP must be 6 digits");
    run(async () => { const { token } = await api.verifyOtp(phone, otp); onLoggedIn(token); });
  };

  return (
    <View style={s.wrap}>
      <Text style={s.logo}>MiniLedger</Text>
      <Text style={s.sub}>Track money you lend to friends</Text>
      <TextInput style={s.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} editable={!otpSent} />
      {otpSent && <TextInput style={s.input} placeholder="6-digit OTP" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />}
      <Pressable style={s.btn} onPress={otpSent ? verify : sendOtp} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{otpSent ? "Verify & login" : "Send OTP"}</Text>}
      </Pressable>
      {otpSent && <Pressable onPress={() => { setOtpSent(false); setOtp(""); }}><Text style={s.link}>Change number</Text></Pressable>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f1f5f9" },
  logo: { fontSize: 32, fontWeight: "800", textAlign: "center" },
  sub: { textAlign: "center", color: "#666", marginBottom: 28 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  btn: { backgroundColor: "#2563eb", padding: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { color: "#2563eb", textAlign: "center", marginTop: 14 },
});
