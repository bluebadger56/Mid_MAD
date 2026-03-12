import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
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
const MEALS = ["breakfast", "lunch", "dinner"] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Pagi",
  lunch: "Siang",
  dinner: "Malam",
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

export default function MenuManageScreen() {
  const { colors } = useTheme();
  const weekStart = getWeekStart();
  const weeklyMenu = useQuery(api.menus.getWeeklyMenu, {
    week_start: weekStart,
  });
  const setMenuMut = useMutation(api.menus.setMenu);
  const deleteMenuMut = useMutation(api.menus.deleteMenu);
  const seedMenuMut = useMutation(api.menus.seedWeeklyMenu);

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const [selectedDay, setSelectedDay] = useState(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
  );
  const [showForm, setShowForm] = useState(false);
  const [formMeal, setFormMeal] = useState<string>("breakfast");
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const dayMenus = weeklyMenu?.filter((m) => m.day === selectedDay) ?? [];
  const orderedMenus = MEALS.map((mt) =>
    dayMenus.find((m) => m.meal_type === mt),
  ).filter(Boolean);

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Error", "Masukkan nama menu");
      return;
    }
    try {
      await setMenuMut({
        day: selectedDay,
        meal_type: formMeal,
        menu_name: formName.trim(),
        description: formDesc.trim() || undefined,
        week_start: weekStart,
      });
      setFormName("");
      setFormDesc("");
      setShowForm(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Hapus Menu", "Yakin hapus menu ini?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteMenuMut({ id: id as any }),
      },
    ]);
  };

  const handleSeedMenu = async () => {
    setSeedLoading(true);
    setSeedMsg("");
    try {
      const result = await seedMenuMut({ week_start: weekStart });
      setSeedMsg(`✅ ${result.inserted} menu berhasil diisi untuk minggu ini!`);
    } catch (e: any) {
      setSeedMsg(`❌ Gagal: ${e.message}`);
    } finally {
      setSeedLoading(false);
      setTimeout(() => setSeedMsg(""), 4000);
    }
  };

  const handleEdit = (item: any) => {
    setFormMeal(item.meal_type);
    setFormName(item.menu_name);
    setFormDesc(item.description ?? "");
    setShowForm(true);
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
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Kelola Menu
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            Minggu: {weekStart}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setFormName("");
            setFormDesc("");
            setShowForm(true);
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Seed Menu Banner */}
      <View
        style={[
          styles.seedBanner,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>
            Menu Vegan Mingguan
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            Isi otomatis menu sayur vegan Sen–Min + Telur Sabtu siang
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.seedBtn, { backgroundColor: colors.success }]}
          onPress={handleSeedMenu}
          disabled={seedLoading}
        >
          <Ionicons
            name={seedLoading ? "refresh" : "sparkles"}
            size={14}
            color="#fff"
          />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
            {seedLoading ? "Mengisi..." : "Isi Otomatis"}
          </Text>
        </TouchableOpacity>
      </View>
      {seedMsg ? (
        <View
          style={[
            styles.seedMsg,
            {
              backgroundColor: seedMsg.startsWith("✅")
                ? colors.success + "18"
                : colors.danger + "18",
              borderColor: seedMsg.startsWith("✅")
                ? colors.success
                : colors.danger,
            },
          ]}
        >
          <Text
            style={{
              color: seedMsg.startsWith("✅") ? colors.success : colors.danger,
              fontSize: 13,
            }}
          >
            {seedMsg}
          </Text>
        </View>
      ) : null}

      {/* Day Selector */}
      <FlatList
        horizontal
        data={DAYS}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayRow}
        keyExtractor={(d) => d}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dayChip,
              { borderColor: colors.border },
              selectedDay === item && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedDay(item)}
          >
            <Text
              style={[
                styles.dayText,
                { color: selectedDay === item ? "#fff" : colors.textMuted },
              ]}
            >
              {(DAY_LABELS[item] || item).slice(0, 3)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Menu List for Selected Day */}
      <FlatList
        data={orderedMenus as any[]}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="restaurant-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada menu untuk {DAY_LABELS[selectedDay]}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.menuCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.menuTop}>
              <View
                style={[
                  styles.mealBadge,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text style={[styles.mealBadgeText, { color: colors.primary }]}>
                  {MEAL_LABELS[item.meal_type]}
                </Text>
              </View>
              <View style={styles.menuActions}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.menuName, { color: colors.text }]}>
              {item.menu_name}
            </Text>
            {item.description ? (
              <Text style={[styles.menuDesc, { color: colors.textMuted }]}>
                {item.description}
              </Text>
            ) : null}
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {formName ? "Edit" : "Tambah"} Menu - {DAY_LABELS[selectedDay]}
            </Text>

            {/* Meal Type */}
            <View style={styles.mealRow}>
              {MEALS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.mealChip,
                    { borderColor: colors.border },
                    formMeal === m && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setFormMeal(m)}
                >
                  <Text
                    style={{
                      color: formMeal === m ? "#fff" : colors.textMuted,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {MEAL_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Nama menu (misal: Nasi Goreng)"
              placeholderTextColor={colors.textMuted}
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Deskripsi (opsional)"
              placeholderTextColor={colors.textMuted}
              value={formDesc}
              onChangeText={setFormDesc}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowForm(false)}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  dayRow: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  dayText: { fontSize: 13, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 90 },
  menuCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  menuTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  mealBadgeText: { fontSize: 12, fontWeight: "700" },
  menuActions: { flexDirection: "row", gap: 14 },
  menuName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  menuDesc: { fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14 },
  seedBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  seedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  seedMsg: {
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modal: { borderRadius: 16, padding: 20, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  mealRow: { flexDirection: "row", gap: 8 },
  mealChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
