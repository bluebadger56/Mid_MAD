import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const CATEGORIES = [
  { key: "menu", label: "Menu", icon: "restaurant-outline" as const },
  { key: "service", label: "Pelayanan", icon: "people-outline" as const },
  { key: "facility", label: "Fasilitas", icon: "business-outline" as const },
  { key: "other", label: "Lainnya", icon: "chatbubble-outline" as const },
];

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const submit = useMutation(api.feedback.submitFeedback);
  const allFeedback = useQuery(api.feedback.getAllFeedback);

  const [category, setCategory] = useState("menu");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!user) return Alert.alert("Error", "Login diperlukan");
    if (rating === 0)
      return Alert.alert("Error", "Pilih rating terlebih dahulu");
    if (!message.trim()) return Alert.alert("Error", "Tulis pesan feedback");
    try {
      await submit({
        user_id: user._id,
        category: category as any,
        rating,
        message: message.trim(),
      });
      Alert.alert("Berhasil", "Terima kasih atas feedback Anda!");
      setMessage("");
      setRating(0);
      setShowForm(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Kritik & Saran
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowForm(!showForm)}
          >
            <Ionicons
              name={showForm ? "close" : "add"}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Form */}
        {showForm && (
          <View
            style={[
              styles.form,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* Category */}
            <Text style={[styles.label, { color: colors.text }]}>Kategori</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.catChip,
                    { borderColor: colors.border },
                    category === c.key && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setCategory(c.key)}
                >
                  <Ionicons
                    name={c.icon}
                    size={14}
                    color={category === c.key ? "#fff" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.catText,
                      { color: category === c.key ? "#fff" : colors.textMuted },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Ionicons
                    name={s <= rating ? "star" : "star-outline"}
                    size={28}
                    color={s <= rating ? colors.warning : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Message */}
            <Text style={[styles.label, { color: colors.text }]}>Pesan</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Tulis kritik / saran Anda..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Kirim Feedback</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feedback List */}
        <FlatList
          data={allFeedback}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Belum ada feedback
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const cat = CATEGORIES.find((c) => c.key === item.category);
            return (
              <View
                style={[
                  styles.feedbackCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.feedbackHeader}>
                  <View
                    style={[
                      styles.catBadge,
                      { backgroundColor: colors.primary + "15" },
                    ]}
                  >
                    <Ionicons
                      name={(cat?.icon || "chatbubble-outline") as any}
                      size={13}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.catBadgeText, { color: colors.primary }]}
                    >
                      {cat?.label ?? item.category}
                    </Text>
                  </View>
                  <View style={styles.starRow2}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= item.rating ? "star" : "star-outline"}
                        size={13}
                        color={
                          s <= item.rating ? colors.warning : colors.textMuted
                        }
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.feedbackMsg, { color: colors.text }]}>
                  {item.message}
                </Text>
                <Text
                  style={[styles.feedbackTime, { color: colors.textMuted }]}
                >
                  {new Date(item._creationTime).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  form: { margin: 16, padding: 16, borderRadius: 14, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 12 },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  catText: { fontSize: 12, fontWeight: "600" },
  starRow: { flexDirection: "row", gap: 8 },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 80 },
  feedbackCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: { fontSize: 11, fontWeight: "700" },
  starRow2: { flexDirection: "row", gap: 2 },
  feedbackMsg: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
  feedbackTime: { fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14 },
});
