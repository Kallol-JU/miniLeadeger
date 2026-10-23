import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { setOnUnauthorized, setToken } from "./src/api";
import LoansScreen from "./src/screens/LoansScreen";
import LoginScreen from "./src/screens/LoginScreen";

const KEY = "miniledger_token";

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const logout = async () => { setToken(null); await SecureStore.deleteItemAsync(KEY); setLoggedIn(false); };
  const login = async (t: string) => { setToken(t); await SecureStore.setItemAsync(KEY, t); setLoggedIn(true); };

  useEffect(() => {
    setOnUnauthorized(logout); // expired token -> back to login
    SecureStore.getItemAsync(KEY).then((t) => { if (t) { setToken(t); setLoggedIn(true); } }).finally(() => setReady(true));
  }, []);

  if (!ready) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator /></View>;
  return (
    <>
      <StatusBar style="dark" />
      {loggedIn ? <LoansScreen onLogout={logout} /> : <LoginScreen onLoggedIn={login} />}
    </>
  );
}
