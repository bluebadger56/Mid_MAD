import { internalMutation } from "./_generated/server";

/**
 * Migration: Isi field `type` yang kosong di tabel staff_attendance
 *
 * Cara pakai:
 * 1. Pastikan schema.ts sudah menggunakan type: v.optional(v.string())
 * 2. Buka Convex Dashboard → Functions → migrations:fixStaffAttendanceType
 * 3. Klik "Run Function"
 * 4. Setelah selesai, ubah kembali type: v.string() di schema.ts
 */
export const fixStaffAttendanceType = internalMutation(async ({ db }) => {
  const records = await db.query("staff_attendance").collect();

  let fixed = 0;

  for (const record of records) {
    if (!record.type) {
      await db.patch(record._id, { type: "attendance" });
      fixed++;
    }
  }

  console.log(
    `Migration selesai: ${fixed} dari ${records.length} dokumen diperbaiki.`,
  );
  return { fixed, total: records.length };
});
