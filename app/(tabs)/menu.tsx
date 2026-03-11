import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_LABELS: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Pagi",
  lunch: "Siang",
  dinner: "Malam",
};
const MEAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  breakfast: "sunny-outline",
  lunch: "partly-sunny-outline",
  dinner: "moon-outline",
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

export default function MenuScreen() {
  const { colors } = useTheme();
  const weekStart = getWeekStart();
  const weeklyMenu = useQuery(api.menus.getWeeklyMenu, {
    week_start: weekStart,
  });
  const popularity = useQuery(api.menus.getMenuPopularity, {
    week_start: weekStart,
  });
  const [selectedDay, setSelectedDay] = useState(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
  );

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const dayMenus = weeklyMenu?.filter((m) => m.day === selectedDay) ?? [];
  const ordered = ["breakfast", "lunch", "dinner"]
    .map((mt) => dayMenus.find((m) => m.meal_type === mt))
    .filter(Boolean);

  const getPopularity = (mt: string, day: string) => {
    return popularity?.find((p) => p.meal_type === mt && p.day === day);
  };

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
          Menu Mingguan
        </Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          Minggu: {weekStart}
        </Text>
      </View>

      {/* Day Selector */}
      <FlatList
        horizontal
        data={DAYS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayRow}
        keyExtractor={(d) => d}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.dayChip,
              { borderColor: colors.border },
              selectedDay === item && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              index === todayIndex &&
                selectedDay !== item && { borderColor: colors.primary },
            ]}
            onPress={() => setSelectedDay(item)}
          >
            <Text
              style={[
                styles.dayChipText,
                { color: colors.textMuted },
                selectedDay === item && { color: "#fff" },
                index === todayIndex &&
                  selectedDay !== item && { color: colors.primary },
              ]}
            >
              {(DAY_LABELS[item] || item).slice(0, 3)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Menu Cards */}
      <FlatList
        data={ordered as any[]}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.menuList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="restaurant-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada menu untuk {DAY_LABELS[selectedDay] || selectedDay}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const pop = getPopularity(item.meal_type, selectedDay);
          return (
            <View
              style={[
                styles.menuCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {/* Meal type header */}
              <View style={styles.mealHeader}>
                <View
                  style={[
                    styles.mealBadge,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <Ionicons
                    name={(MEAL_ICONS[item.meal_type] || "restaurant") as any}
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.mealBadgeText, { color: colors.primary }]}
                  >
                    {MEAL_LABELS[item.meal_type] || item.meal_type}
                  </Text>
                </View>
                {pop && (
                  <View style={styles.popBadge}>
                    <Ionicons
                      name="people"
                      size={13}
                      color={colors.textMuted}
                    />
                    <Text style={[styles.popText, { color: colors.textMuted }]}>
                      {pop.totalEaters} mahasiswa
                    </Text>
                  </View>
                )}
              </View>

              {/* Menu Name */}
              <Text style={[styles.menuName, { color: colors.text }]}>
                {item.menu_name}
              </Text>

              {/* Description */}
              {item.description ? (
                <Text style={[styles.menuDesc, { color: colors.textMuted }]}>
                  {item.description}
                </Text>
              ) : null}
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
  dayRow: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  dayChipText: { fontSize: 13, fontWeight: "600" },
  menuList: { paddingHorizontal: 16, gap: 12, paddingBottom: 80 },
  menuCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mealBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  mealBadgeText: { fontWeight: "700", fontSize: 12 },
  popBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  popText: { fontSize: 12 },
  menuName: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  menuDesc: { fontSize: 13, lineHeight: 19 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14 },
});
