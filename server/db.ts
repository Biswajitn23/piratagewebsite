// Stub DB adapter removed in favor of Firestore / JSON fallback.
// Keep a lightweight stub export to avoid build-time type errors in environments
// that still import getDb. Use the events routes which prefer Firestore or the
// JSON file store instead.

export async function getDb(): Promise<null> {
  throw new Error("SQLite adapter removed. Use Firestore or JSON fallback (see server/routes/events.ts)");
}
