import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const mealStats = useQuery(api.mealCards.getMealStats, { date: today });

  if (!user) {
    router.replace("/login");
    return null;
  }

  const stats = [
    {
      label: "Sarapan",
      value: mealStats?.breakfast ?? 0,
      icon: "sunny-outline" as const,
      color: colors.warning,
    },
    {
      label: "Makan Siang",
      value: mealStats?.lunch ?? 0,
      icon: "partly-sunny-outline" as const,
      color: colors.primary,
    },
    {
      label: "Makan Malam",
      value: mealStats?.dinner ?? 0,
      icon: "moon-outline" as const,
      color: "#8b5cf6",
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
            router.replace("/login");
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

      {/* Today Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Hari Ini ({today})
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
          Jumlah mahasiswa makan hari ini
        </Text>
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[styles.statIcon, { backgroundColor: s.color + "15" }]}
              >
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
        <View
          style={[
            styles.totalCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
            Total Makan Hari Ini
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {mealStats?.total ?? 0} mahasiswa
          </Text>
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
