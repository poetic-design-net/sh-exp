"use server";

import { db } from "lib/firebase-admin-server";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function archiveCompletedOrders() {
  try {
    console.log('Starting archival process...');
    
    // Get all completed orders that aren't explicitly archived
    const snapshot = await db.collection("orders")
      .where("status", "==", "completed")
      .get();

    // Filter out orders that are already archived
    const ordersToArchive = snapshot.docs.filter(doc => {
      const data = doc.data();
      return data.isArchived !== true;
    });

    console.log(`Found ${ordersToArchive.length} orders to archive`);

    if (ordersToArchive.length === 0) {
      console.log('No orders to archive');
      return { message: "Keine abgeschlossenen Bestellungen zum Archivieren gefunden" };
    }

    // Update all orders in batch
    const batch = db.batch();
    const now = Date.now();
    let count = 0;

    ordersToArchive.forEach((doc: QueryDocumentSnapshot) => {
      console.log(`Preparing to archive order ${doc.id}`);
      count++;
      batch.update(doc.ref, {
        isArchived: true,
        updatedAt: now
      });
    });

    console.log(`Committing batch update for ${count} orders...`);
    await batch.commit();
    console.log('Batch update completed successfully');
    revalidatePath('/admin/orders');

    return { 
      message: `${ordersToArchive.length} Bestellung${ordersToArchive.length === 1 ? '' : 'en'} wurden archiviert`,
      archivedCount: ordersToArchive.length
    };
  } catch (error) {
    console.error('Error archiving completed orders:', error);
    throw new Error('Fehler beim Archivieren der Bestellungen');
  }
}
