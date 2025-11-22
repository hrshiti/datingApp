import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Profile from './src/models/Profile.model.js';
import { Interaction, Match } from './src/models/Interaction.model.js';

// Load environment variables
dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database: ${dbName}`);

    // Delete all collections
    console.log('\n🗑️  Starting to delete all data...\n');

    // Delete Users
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      await User.deleteMany({});
      console.log(`✅ Deleted ${userCount} user(s)`);
    } else {
      console.log('ℹ️  No users to delete');
    }

    // Delete Profiles
    const profileCount = await Profile.countDocuments();
    if (profileCount > 0) {
      await Profile.deleteMany({});
      console.log(`✅ Deleted ${profileCount} profile(s)`);
    } else {
      console.log('ℹ️  No profiles to delete');
    }

    // Delete Interactions
    const interactionCount = await Interaction.countDocuments();
    if (interactionCount > 0) {
      await Interaction.deleteMany({});
      console.log(`✅ Deleted ${interactionCount} interaction(s)`);
    } else {
      console.log('ℹ️  No interactions to delete');
    }

    // Delete Matches
    const matchCount = await Match.countDocuments();
    if (matchCount > 0) {
      await Match.deleteMany({});
      console.log(`✅ Deleted ${matchCount} match(es)`);
    } else {
      console.log('ℹ️  No matches to delete');
    }

    // Get all collection names and delete any remaining collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Checking for other collections...');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      // Skip system collections
      if (!collectionName.startsWith('system.')) {
        try {
          const count = await mongoose.connection.db.collection(collectionName).countDocuments();
          if (count > 0) {
            await mongoose.connection.db.collection(collectionName).deleteMany({});
            console.log(`✅ Deleted ${count} document(s) from ${collectionName}`);
          }
        } catch (error) {
          console.log(`⚠️  Could not delete ${collectionName}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ ==========================================');
    console.log('✅ Database cleared successfully!');
    console.log('✅ All data has been deleted');
    console.log('✅ ==========================================\n');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ==========================================');
    console.error('❌ Error clearing database:');
    console.error('❌', error.message);
    console.error('❌ ==========================================\n');
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
clearDatabase();

