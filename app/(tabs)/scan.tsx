import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
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
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [today]);
  return today;
}

export default function ScanScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const today = useToday();
  const scanMutation = useMutation(api.mealCards.scanMealCard);
  const myScans = useQuery(
    api.mealCards.getMyScansToday,
    user ? { userId: user._id, date: today } : "skip",
  );

  const [cardInput, setCardInput] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">(
    "breakfast",
  );
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Jadwal waktu scan yang diizinkan (jam)
  const MEAL_WINDOWS = {
    breakfast: { start: 6, end: 7, label: "06:00 – 07:00" },
    lunch: { start: 12, end: 13, label: "12:00 – 13:00" },
    dinner: { start: 18, end: 19, label: "18:00 – 19:00" },
  };

  const isWithinWindow = (key: "breakfast" | "lunch" | "dinner") => {
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const t = hour + minute / 60;
    const w = MEAL_WINDOWS[key];
    return t >= w.start && t < w.end;
  };

  // Auto-pilih waktu makan aktif saat ini
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 7) setMealType("breakfast");
    else if (hour >= 12 && hour < 13) setMealType("lunch");
    else if (hour >= 18 && hour < 19) setMealType("dinner");
    // di luar jadwal tetap tampilkan pilihan terakhir yang relevan
    else if (hour < 12) setMealType("breakfast");
    else if (hour < 18) setMealType("lunch");
    else setMealType("dinner");
  }, []);

  const handleScan = async () => {
    const id = cardInput.trim() || user?.card_id;
    if (!id) {
      setLastResult({ success: false, message: "Masukkan Card ID" });
      return;
    }
    if (!isWithinWindow(mealType)) {
      const w = MEAL_WINDOWS[mealType];
      const labels = { breakfast: "Pagi", lunch: "Siang", dinner: "Malam" };
      setLastResult({
        success: false,
        message: `Di luar jadwal makan ${labels[mealType]} (${w.label})`,
      });
      return;
    }
    try {
      const result = await scanMutation({ card_id: id, meal_type: mealType });
      setLastResult(result);
      if (result.success) setCardInput("");
    } catch (e: any) {
      setLastResult({ success: false, message: e.message });
    }
  };

  const mealTypes = [
    {
      key: "breakfast" as const,
      label: "Pagi",
      time: "06:00 – 07:00",
      icon: "sunny-outline" as const,
      color: colors.warning,
    },
    {
      key: "lunch" as const,
      label: "Siang",
      time: "12:00 – 13:00",
      icon: "partly-sunny-outline" as const,
      color: colors.primary,
    },
    {
      key: "dinner" as const,
      label: "Malam",
      time: "18:00 – 19:00",
      icon: "moon-outline" as const,
      color: "#8b5cf6",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Scan Kartu Makan
        </Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          {today}
        </Text>
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealRow}>
        {mealTypes.map((m) => {
          const active = isWithinWindow(m.key);
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.mealBtn,
                {
                  borderColor: active ? m.color : colors.border,
                  opacity: active ? 1 : 0.55,
                },
                mealType === m.key && {
                  backgroundColor: m.color,
                  borderColor: m.color,
                },
              ]}
              onPress={() => setMealType(m.key)}
            >
              <Ionicons
                name={m.icon}
                size={18}
                color={mealType === m.key ? "#fff" : m.color}
              />
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: mealType === m.key ? "#fff" : colors.textMuted,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {m.label}
                </Text>
                <Text
                  style={{
                    color:
                      mealType === m.key ? "rgba(255,255,255,0.85)" : m.color,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {m.time}
                </Text>
                {active && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: mealType === m.key ? "#fff" : m.color,
                      marginTop: 3,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Card Input */}
      <View style={styles.scanSection}>
        <View
          style={[
            styles.inputBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="card-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={
              user?.card_id
                ? `Card ID (default: ${user.card_id})`
                : "Masukkan Card ID"
            }
            placeholderTextColor={colors.textMuted}
            value={cardInput}
            onChangeText={setCardInput}
          />
        </View>
        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: colors.primary }]}
          onPress={handleScan}
        >
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Result */}
      {lastResult && (
        <View
          style={[
            styles.resultBox,
            {
              backgroundColor: lastResult.success
                ? colors.success + "15"
                : colors.danger + "15",
              borderColor: lastResult.success ? colors.success : colors.danger,
            },
          ]}
        >
          <Ionicons
            name={lastResult.success ? "checkmark-circle" : "close-circle"}
            size={22}
            color={lastResult.success ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.resultText,
              { color: lastResult.success ? colors.success : colors.danger },
            ]}
          >
            {lastResult.message}
          </Text>
        </View>
      )}

      {/* Today's Scan History */}
      <View style={styles.historyHeader}>
        <Text style={[styles.historyTitle, { color: colors.text }]}>
          Riwayat Scan Kamu Hari Ini
        </Text>
        <Text style={[styles.historyCount, { color: colors.textMuted }]}>
          {myScans?.length ?? 0}/3 waktu makan
        </Text>
      </View>

      <FlatList
        data={myScans}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada scan hari ini
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const mealLabel =
            item.meal_type === "breakfast"
              ? "Sarapan"
              : item.meal_type === "lunch"
                ? "Makan Siang"
                : "Makan Malam";
          const mealColor =
            item.meal_type === "breakfast"
              ? colors.warning
              : item.meal_type === "lunch"
                ? colors.primary
                : "#8b5cf6";
          const mealIcon =
            item.meal_type === "breakfast"
              ? ("sunny-outline" as const)
              : item.meal_type === "lunch"
                ? ("partly-sunny-outline" as const)
                : ("moon-outline" as const);
          return (
            <View
              style={[
                styles.scanItem,
                {
                  backgroundColor: mealColor + "12",
                  borderColor: mealColor,
                },
              ]}
            >
              <View
                style={[styles.scanIcon, { backgroundColor: mealColor + "25" }]}
              >
                <Ionicons name={mealIcon} size={18} color={mealColor} />
              </View>
              <View style={styles.scanInfo}>
                <Text style={[styles.scanName, { color: colors.text }]}>
                  {mealLabel}
                </Text>
                <Text style={[styles.scanMeta, { color: colors.textMuted }]}>
                  Berhasil scan ✓
                </Text>
              </View>
              <Text style={[styles.scanTime, { color: mealColor }]}>
                {new Date(item.scanned_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  mealRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mealBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  scanSection: { paddingHorizontal: 16, gap: 10 },
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
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultText: { fontSize: 13, fontWeight: "600", flex: 1 },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  historyTitle: { fontSize: 15, fontWeight: "700" },
  historyCount: { fontSize: 12 },
  listContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 80 },
  scanItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  scanIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  scanInfo: { flex: 1 },
  scanName: { fontSize: 14, fontWeight: "600" },
  scanMeta: { fontSize: 11, marginTop: 2 },
  scanTime: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
