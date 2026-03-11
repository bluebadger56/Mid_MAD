import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StaffDashboard() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const mealStats = useQuery(api.mealCards.getMealStats, { date: today });
  const todayAttendance = useQuery(api.attendance.getAttendanceByDate, {
    date: today,
  });
  const stockSummary = useQuery(api.inventory.getStockSummary);

  const unbalancedItems =
    stockSummary?.filter((i) => !i.isBalanced).length ?? 0;
  const totalStaff = todayAttendance?.length ?? 0;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

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
            Staff Dashboard
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name ?? "Staff"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.danger + "15" }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Meal Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Statistik Makan Hari Ini
      </Text>
      <View style={styles.statsRow}>
        {[
          {
            label: "Pagi",
            count: mealStats?.breakfast ?? 0,
            icon: "sunny-outline" as const,
            color: colors.warning,
          },
          {
            label: "Siang",
            count: mealStats?.lunch ?? 0,
            icon: "partly-sunny-outline" as const,
            color: colors.primary,
          },
          {
            label: "Malam",
            count: mealStats?.dinner ?? 0,
            icon: "moon-outline" as const,
            color: "#8b5cf6",
          },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name={s.icon} size={22} color={s.color} />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {s.count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Info Cards */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Ringkasan
      </Text>
      <View style={styles.infoGrid}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.infoNum, { color: colors.text }]}>
            {totalStaff}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            Staff Hadir
          </Text>
        </View>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="restaurant" size={24} color={colors.success} />
          <Text style={[styles.infoNum, { color: colors.text }]}>
            {mealStats?.total ?? 0}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            Total Scan
          </Text>
        </View>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="warning"
            size={24}
            color={unbalancedItems > 0 ? colors.danger : colors.success}
          />
          <Text style={[styles.infoNum, { color: colors.text }]}>
            {unbalancedItems}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
            Stok Bermasalah
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  greeting: { fontSize: 13 },
  name: { fontSize: 20, fontWeight: "700" },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  infoCard: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    flexGrow: 1,
  },
  infoNum: { fontSize: 20, fontWeight: "800" },
  infoLabel: { fontSize: 11, textAlign: "center" },
});
