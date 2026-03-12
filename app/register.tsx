import { api } from "@/convex/_generated/api";
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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const registerMutation = useMutation(api.auth.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "staff">("student");
  const [type, setType] = useState<"insider" | "outsider">("insider");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Isi nama, email, dan password");
      return;
    }
    setLoading(true);
    try {
      const result = await registerMutation({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        type: role === "staff" ? "insider" : type,
      });
      if (role === "student" && result.card_id) {
        setSuccess(
          `Akun berhasil dibuat! Card ID kamu: ${result.card_id} — simpan baik-baik ya!`,
        );
      } else {
        setSuccess("Akun berhasil dibuat! Silakan login.");
      }
      setTimeout(() => router.replace("/login"), 3000);
    } catch (e: any) {
      setError(e.message ?? "Gagal mendaftar");
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Daftar Akun</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Buat akun baru untuk dining system
        </Text>

        {/* Role Toggle */}
        <View style={styles.toggleRow}>
          {(["student", "staff"] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.toggleBtn,
                { borderColor: colors.border },
                role === r && { backgroundColor: colors.primary },
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={{
                  color: role === r ? "#fff" : colors.textMuted,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {r === "student" ? "Mahasiswa" : "Staff Dining"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            <Ionicons
              name="person-outline"
              size={18}
              color={colors.textMuted}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Nama Lengkap"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

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
              secureTextEntry
            />
          </View>

          {role === "student" && (
            <>
              {/* Card ID auto-generated — info box */}
              <View
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: 0.8,
                  },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <Text
                  style={{ color: colors.textMuted, fontSize: 14, flex: 1 }}
                >
                  Card ID 7 digit akan dibuat otomatis
                </Text>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
              </View>

              {/* Insider / Outsider */}
              <Text style={[styles.label, { color: colors.textMuted }]}>
                Status Asrama
              </Text>
              <View style={styles.toggleRow}>
                {(["insider", "outsider"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.toggleBtn,
                      { borderColor: colors.border },
                      type === t && {
                        backgroundColor:
                          t === "insider" ? colors.success : colors.warning,
                      },
                    ]}
                    onPress={() => setType(t)}
                  >
                    <Text
                      style={{
                        color: type === t ? "#fff" : colors.textMuted,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {t === "insider" ? "Anak Asrama" : "Outsider"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Daftar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 4 },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  form: { gap: 12 },
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
  registerBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
