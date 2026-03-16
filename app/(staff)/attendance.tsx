import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
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
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [today]);
  return today;
}

export default function AttendanceScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const today = useToday();

  const clockInMut = useMutation(api.attendance.clockIn);
  const clockOutMut = useMutation(api.attendance.clockOut);
  const todayRecords = useQuery(api.attendance.getAttendanceByDate, {
    date: today,
  });
  const myAttendance = useQuery(
    api.attendance.getMyAttendance,
    user ? { user_id: user._id as any } : "skip",
  );

  const myToday = todayRecords?.find((r) => r.user_id === user?._id);

  const handleClockIn = async () => {
    if (!user) return;
    try {
      const result = await clockInMut({ user_id: user._id as any });
      Alert.alert(result.success ? "Berhasil" : "Gagal", result.message);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    try {
      const result = await clockOutMut({ user_id: user._id as any });
      Alert.alert(result.success ? "Berhasil" : "Gagal", result.message);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "--:--";
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
          Absensi
        </Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          {today}
        </Text>
      </View>

      {/* Clock In / Out Buttons */}
      <View style={styles.clockArea}>
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={myToday ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={myToday ? colors.success : colors.textMuted}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: colors.text }]}>
              {myToday
                ? `Status: ${myToday.status === "late" ? "Terlambat" : "Hadir"}`
                : "Belum Clock In"}
            </Text>
            {myToday && (
              <Text style={[styles.statusTime, { color: colors.textMuted }]}>
                Masuk: {formatTime(myToday.clock_in)} · Keluar:{" "}
                {formatTime(myToday.clock_out)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.clockBtn, { backgroundColor: colors.success }]}
            onPress={handleClockIn}
            disabled={!!myToday}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.clockBtnText}>Clock In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.clockBtn, { backgroundColor: colors.danger }]}
            onPress={handleClockOut}
            disabled={!myToday || !!myToday.clock_out}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.clockBtnText}>Clock Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's All Staff Attendance */}
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          Staff Hari Ini
        </Text>
        <Text style={[styles.listCount, { color: colors.textMuted }]}>
          {todayRecords?.length ?? 0}
        </Text>
      </View>

      <FlatList
        data={todayRecords}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Belum ada yang absen
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.attendItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.attendIcon,
                {
                  backgroundColor:
                    item.status === "late"
                      ? colors.warning + "15"
                      : colors.success + "15",
                },
              ]}
            >
              <Ionicons
                name="person"
                size={16}
                color={item.status === "late" ? colors.warning : colors.success}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.attendName, { color: colors.text }]}>
                {item.userName}
              </Text>
              <Text style={[styles.attendMeta, { color: colors.textMuted }]}>
                {item.status === "late" ? "Terlambat" : "Hadir"} ·{" "}
                {formatTime(item.clock_in)} - {formatTime(item.clock_out)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* My History */}
      {myAttendance && myAttendance.length > 0 && (
        <>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.text }]}>
              Riwayat Saya
            </Text>
          </View>
          <FlatList
            data={myAttendance.slice(0, 7)}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={[styles.listContent, { paddingBottom: 90 }]}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.histDate, { color: colors.text }]}>
                  {item.date}
                </Text>
                <Text style={[styles.histTime, { color: colors.textMuted }]}>
                  {formatTime(item.clock_in)} - {formatTime(item.clock_out)}
                </Text>
                <View
                  style={[
                    styles.histBadge,
                    {
                      backgroundColor:
                        item.status === "late"
                          ? colors.warning + "15"
                          : colors.success + "15",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color:
                        item.status === "late"
                          ? colors.warning
                          : colors.success,
                    }}
                  >
                    {item.status === "late" ? "Terlambat" : "Hadir"}
                  </Text>
                </View>
              </View>
            )}
          />
        </>
      )}
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
  clockArea: { padding: 16, gap: 12 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusLabel: { fontSize: 15, fontWeight: "700" },
  statusTime: { fontSize: 12, marginTop: 2 },
  btnRow: { flexDirection: "row", gap: 10 },
  clockBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  clockBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listTitle: { fontSize: 15, fontWeight: "700" },
  listCount: { fontSize: 12 },
  listContent: { paddingHorizontal: 16, gap: 8 },
  attendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  attendIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  attendName: { fontSize: 14, fontWeight: "600" },
  attendMeta: { fontSize: 11, marginTop: 2 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  histDate: { fontSize: 13, fontWeight: "600", width: 90 },
  histTime: { flex: 1, fontSize: 12 },
  histBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
