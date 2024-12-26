import { db } from '../lib/firebase-admin';

async function updateAdminRole(userId: string) {
  try {
    console.log('Updating admin role for user:', userId);
    
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      role: 'admin',
      updatedAt: Date.now()
    });

    console.log('Successfully updated user to admin:', userId);
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
}

// Your existing user ID from the migration
const userId = 'KKthoq2LmUNoTwYULSpuUftRNLN2';

updateAdminRole(userId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
