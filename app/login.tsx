import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { setUser } = useAuth();
  const loginMutation = useMutation(api.auth.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Isi email dan password");
      return;
    }
    setLoading(true);
    try {
      const user = await loginMutation({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      await setUser(user as any);
      if (user.role === "staff" || user.role === "admin") {
        router.replace("/(staff)");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      setError(e.message ?? "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
      >
        {/* Logo */}
        <View
          style={[styles.logoBox, { backgroundColor: colors.primary + "15" }]}
        >
          <Ionicons name="restaurant" size={56} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Dining Management
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Sistem Makan Asrama Kampus
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View
              style={[
                styles.msgBox,
                {
                  backgroundColor: colors.danger + "20",
                  borderColor: colors.danger,
                },
              ]}
            >
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>
                {error}
              </Text>
            </View>
          ) : null}
          {success ? (
            <View
              style={[
                styles.msgBox,
                {
                  backgroundColor: colors.success + "20",
                  borderColor: colors.success,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={{ color: colors.success, fontSize: 13, flex: 1 }}>
                {success}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.inputBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View
            style={[
              styles.inputBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.registerText, { color: colors.textMuted }]}>
              Belum punya akun?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                Daftar
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 36 },
  form: { width: "100%", gap: 14 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15 },
  loginBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerLink: { alignItems: "center", marginTop: 8 },
  registerText: { fontSize: 14 },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
