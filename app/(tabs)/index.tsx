import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function useToday() {
  const [today, setToday] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  useEffect(() => {
    const check = () => {
      const now = new Date().toISOString().split("T")[0];
      if (now !== today) setToday(now);
    };
    const interval = setInterval(check, 60000); // check every minute
    return () => clearInterval(interval);
  }, [today]);
  return today;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const today = useToday();
  const myMealStatus = useQuery(
    api.mealCards.getMyMealStatus,
    user ? { userId: user._id, date: today } : "skip",
  );

  if (!user) return null;

  const meals = [
    {
      key: "breakfast" as const,
      label: "Sarapan",
      icon: "sunny-outline" as const,
      color: colors.warning,
      done: myMealStatus?.breakfast ?? false,
      at: myMealStatus?.breakfastAt ?? null,
    },
    {
      key: "lunch" as const,
      label: "Makan Siang",
      icon: "partly-sunny-outline" as const,
      color: colors.primary,
      done: myMealStatus?.lunch ?? false,
      at: myMealStatus?.lunchAt ?? null,
    },
    {
      key: "dinner" as const,
      label: "Makan Malam",
      icon: "moon-outline" as const,
      color: "#8b5cf6",
      done: myMealStatus?.dinner ?? false,
      at: myMealStatus?.dinnerAt ?? null,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>
            Selamat Datang
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  user.type === "insider"
                    ? colors.success + "20"
                    : colors.warning + "20",
              },
            ]}
          >
            <Text
              style={{
                color:
                  user.type === "insider" ? colors.success : colors.warning,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {user.type === "insider" ? "Anak Asrama" : "Outsider"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await logout();
          }}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Card ID */}
      {user.card_id && (
        <View style={[styles.cardSection, { backgroundColor: colors.primary }]}>
          <Ionicons name="card" size={32} color="#fff" />
          <View>
            <Text style={styles.cardLabel}>Kartu Makan</Text>
            <Text style={styles.cardId}>{user.card_id}</Text>
          </View>
        </View>
      )}

      {/* Today Meal Status */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Status Makan Hari Ini ({today})
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
          {myMealStatus?.total ?? 0}/3 waktu makan selesai
        </Text>
        <View style={styles.statsRow}>
          {meals.map((m, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                {
                  backgroundColor: m.done ? m.color + "18" : colors.surface,
                  borderColor: m.done ? m.color : colors.border,
                },
              ]}
            >
              <View
                style={[styles.statIcon, { backgroundColor: m.color + "20" }]}
              >
                <Ionicons name={m.icon} size={22} color={m.color} />
              </View>
              <Ionicons
                name={m.done ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={m.done ? m.color : colors.border}
              />
              <Text
                style={[
                  styles.statValue,
                  { color: m.done ? m.color : colors.textMuted, fontSize: 13 },
                ]}
              >
                {m.done ? "Sudah" : "Belum"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {m.label}
              </Text>
              {m.done && m.at && (
                <Text style={{ color: m.color, fontSize: 10, marginTop: 2 }}>
                  {new Date(m.at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Quick Menu */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Menu Cepat
        </Text>
        <View style={styles.quickRow}>
          {[
            {
              label: "Scan Kartu",
              icon: "card-outline" as const,
              tab: "/(tabs)/scan",
            },
            {
              label: "Menu Minggu Ini",
              icon: "restaurant-outline" as const,
              tab: "/(tabs)/menu",
            },
            {
              label: "Feedback",
              icon: "chatbubble-outline" as const,
              tab: "/(tabs)/feedback",
            },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.quickCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push(item.tab as any)}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 18,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 13, marginBottom: 2 },
  name: { fontSize: 20, fontWeight: "800" },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  cardSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    margin: 16,
    borderRadius: 16,
    padding: 18,
  },
  cardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  cardId: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 2 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  totalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 16, fontWeight: "700" },
  quickRow: { flexDirection: "row", gap: 10 },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
});
