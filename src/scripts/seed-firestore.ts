/**
 * One-shot seed script: pushes the bundled `workers` and `companies`
 * arrays into Firestore. Use it once after configuring Firebase, then
 * forget about it.
 *
 * Usage (in browser console while the app is running):
 *
 *   import("/src/scripts/seed-firestore.ts").then(m => m.seedAll());
 *
 * Or import it from a temporary route/button.
 */
import { collection, doc, writeBatch } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/integrations/firebase/client";
import { workers } from "@/data/workers";
import { companies } from "@/data/companies";

async function batchWrite<T extends { id: string }>(name: string, items: T[]) {
  const db = getDb();
  const ref = collection(db, name);
  // Firestore batches max 500 ops.
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db);
    for (const item of items.slice(i, i + 400)) {
      batch.set(doc(ref, item.id), item);
    }
    await batch.commit();
  }
}

export async function seedWorkers() {
  if (!isFirebaseConfigured) throw new Error("Firebase non configuré.");
  await batchWrite("workers", workers);
  console.log(`✓ Seeded ${workers.length} workers`);
}

export async function seedCompanies() {
  if (!isFirebaseConfigured) throw new Error("Firebase non configuré.");
  await batchWrite("companies", companies);
  console.log(`✓ Seeded ${companies.length} companies`);
}

export async function seedAll() {
  await seedWorkers();
  await seedCompanies();
  console.log("✓ All seeded.");
}
