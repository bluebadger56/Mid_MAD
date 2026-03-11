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

const UNITS = ["kg", "liter", "pcs", "pack"];

export default function InventoryScreen() {
  const { colors } = useTheme();
  const items = useQuery(api.inventory.getItems);
  const stockSummary = useQuery(api.inventory.getStockSummary);
  const addItem = useMutation(api.inventory.addItem);
  const recordTx = useMutation(api.inventory.recordTransaction);
  const deleteItem = useMutation(api.inventory.deleteItem);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("");

  const [txModal, setTxModal] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [txQty, setTxQty] = useState("");
  const [txNote, setTxNote] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return Alert.alert("Error", "Masukkan nama item");
    try {
      await addItem({
        name: name.trim(),
        unit,
        current_stock: Number(stock) || 0,
      });
      setName("");
      setStock("");
      setShowAdd(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleTx = async () => {
    if (!txModal || !txQty) return;
    try {
      await recordTx({
        item_id: txModal.id as any,
        type: txType,
        quantity: Number(txQty),
        note: txNote.trim() || undefined,
      });
      setTxModal(null);
      setTxQty("");
      setTxNote("");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus Item", `Yakin hapus "${name}"?`, [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteItem({ id: id as any }),
      },
    ]);
  };

  const getSummary = (id: string) => stockSummary?.find((s) => s._id === id);

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
          Inventory
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowAdd(!showAdd)}
        >
          <Ionicons name={showAdd ? "close" : "add"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add Form */}
      {showAdd && (
        <View
          style={[
            styles.form,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Nama barang"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.formRow}>
            <View style={styles.unitRow}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitChip,
                    { borderColor: colors.border },
                    unit === u && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={{
                      color: unit === u ? "#fff" : colors.textMuted,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.inputSmall,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Stok awal"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
          >
            <Text style={styles.submitText}>Tambah Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada item
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const summary = getSummary(item._id);
          const balanced = summary?.isBalanced;
          return (
            <View
              style={[
                styles.itemCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.itemTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemStock, { color: colors.textMuted }]}>
                    Stok:{" "}
                    <Text style={{ fontWeight: "700", color: colors.text }}>
                      {item.current_stock}
                    </Text>{" "}
                    {item.unit}
                  </Text>
                </View>
                {balanced !== undefined && (
                  <View
                    style={[
                      styles.balanceBadge,
                      {
                        backgroundColor: balanced
                          ? colors.success + "15"
                          : colors.danger + "15",
                      },
                    ]}
                  >
                    <Ionicons
                      name={balanced ? "checkmark" : "alert"}
                      size={13}
                      color={balanced ? colors.success : colors.danger}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: balanced ? colors.success : colors.danger,
                      }}
                    >
                      {balanced ? "Sesuai" : "Tidak Sesuai"}
                    </Text>
                  </View>
                )}
              </View>

              {summary && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryText, { color: colors.success }]}>
                    Masuk: {summary.totalIn} {item.unit}
                  </Text>
                  <Text style={[styles.summaryText, { color: colors.danger }]}>
                    Keluar: {summary.totalOut} {item.unit}
                  </Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.success + "15" },
                  ]}
                  onPress={() => {
                    setTxModal({ id: item._id, name: item.name });
                    setTxType("in");
                  }}
                >
                  <Ionicons
                    name="arrow-down"
                    size={14}
                    color={colors.success}
                  />
                  <Text
                    style={{
                      color: colors.success,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Masuk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.warning + "15" },
                  ]}
                  onPress={() => {
                    setTxModal({ id: item._id, name: item.name });
                    setTxType("out");
                  }}
                >
                  <Ionicons name="arrow-up" size={14} color={colors.warning} />
                  <Text
                    style={{
                      color: colors.warning,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Keluar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.danger + "15" },
                  ]}
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Ionicons name="trash" size={14} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Transaction Modal */}
      <Modal visible={!!txModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {txType === "in" ? "Stok Masuk" : "Stok Keluar"}: {txModal?.name}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Jumlah"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={txQty}
              onChangeText={setTxQty}
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
              placeholder="Catatan (opsional)"
              placeholderTextColor={colors.textMuted}
              value={txNote}
              onChangeText={setTxNote}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setTxModal(null)}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor:
                      txType === "in" ? colors.success : colors.warning,
                  },
                ]}
                onPress={handleTx}
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  form: { margin: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  formRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  unitRow: { flexDirection: "row", gap: 6, flex: 1 },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    width: 90,
  },
  submitBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  listContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 90 },
  itemCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  itemTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  itemName: { fontSize: 15, fontWeight: "700" },
  itemStock: { fontSize: 13, marginTop: 2 },
  balanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  summaryText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modal: { borderRadius: 16, padding: 20, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
