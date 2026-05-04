/**
 * Migration: warehouse_staff → warehouse_operator
 *
 * Run once to update all existing User documents that still carry the
 * old 'warehouse_staff' role value to the new 'warehouse_operator' value.
 *
 * Usage:
 *   node scripts/migrateRoles.js
 *
 * The script connects using the MONGO_URI from .env, runs the update,
 * prints a summary, and exits cleanly.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  console.log('🔗  Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅  Connected.\n');

  // Direct collection update — bypasses Mongoose enum validation intentionally
  // so we can rename the stale value that is no longer in the schema.
  const db = mongoose.connection.db;
  const result = await db.collection('users').updateMany(
    { role: 'warehouse_staff' },
    { $set: { role: 'warehouse_operator' } }
  );

  console.log(`📊  Migration complete:`);
  console.log(`    Documents matched  : ${result.matchedCount}`);
  console.log(`    Documents modified : ${result.modifiedCount}`);

  if (result.modifiedCount === 0) {
    console.log('\n    ℹ️   No documents needed updating (already migrated or none found).');
  } else {
    console.log('\n    ✅  All warehouse_staff users are now warehouse_operator.');
  }

  await mongoose.disconnect();
  console.log('\n🔌  Disconnected. Done.');
}

migrate().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
