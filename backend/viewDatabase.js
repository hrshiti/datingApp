import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Profile from './src/models/Profile.model.js';
import { Interaction, Match } from './src/models/Interaction.model.js';

dotenv.config();

const viewDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('✅ MongoDB Connected\n');

    // Get counts
    const userCount = await User.countDocuments();
    const profileCount = await Profile.countDocuments();
    const interactionCount = await Interaction.countDocuments();
    const matchCount = await Match.countDocuments();

    console.log('📊 Database Summary:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Profiles: ${profileCount}`);
    console.log(`   - Interactions: ${interactionCount}`);
    console.log(`   - Matches: ${matchCount}\n`);

    // Get all users with profiles
    const users = await User.find({})
      .populate('profile')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('👥 Users Data:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user._id}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Country Code: ${user.countryCode}`);
      console.log(`   Verified: ${user.isPhoneVerified}`);
      console.log(`   Premium: ${user.isPremium || false}`);
      console.log(`   Last Active: ${user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : 'Never'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
      
      if (user.profile) {
        console.log(`   📋 Profile:`);
        console.log(`     - Name: ${user.profile.name || 'N/A'}`);
        console.log(`     - Age: ${user.profile.age || 'N/A'}`);
        console.log(`     - Gender: ${user.profile.gender || 'N/A'}`);
        console.log(`     - Orientation: ${user.profile.orientation || 'N/A'}`);
        console.log(`     - Looking For: ${user.profile.lookingFor?.join(', ') || 'N/A'}`);
        console.log(`     - City: ${user.profile.location?.city || 'N/A'}`);
        console.log(`     - Coordinates: ${user.profile.location?.coordinates?.coordinates ? `[${user.profile.location.coordinates.coordinates[0]}, ${user.profile.location.coordinates.coordinates[1]}]` : 'N/A'}`);
        console.log(`     - Age Range: ${user.profile.ageRange?.min || 'N/A'} - ${user.profile.ageRange?.max || 'N/A'}`);
        console.log(`     - Distance Pref: ${user.profile.distancePref || 'N/A'} km`);
        console.log(`     - Interests: ${user.profile.interests?.length || 0} (${user.profile.interests?.slice(0, 3).join(', ') || 'None'}${user.profile.interests?.length > 3 ? '...' : ''})`);
        console.log(`     - Photos: ${user.profile.photos?.length || 0}`);
        console.log(`     - Bio: ${user.profile.bio ? (user.profile.bio.substring(0, 50) + (user.profile.bio.length > 50 ? '...' : '')) : 'N/A'}`);
        console.log(`     - Completion: ${user.profile.completionPercentage || 0}%`);
        console.log(`     - Onboarding Completed: ${user.profile.onboardingCompleted || false}`);
        
        // Personality
        if (user.profile.personality) {
          console.log(`     - Personality: ${Object.keys(user.profile.personality).filter(k => user.profile.personality[k]).join(', ')}`);
        }
        
        // Dealbreakers
        if (user.profile.dealbreakers) {
          const dealbreakers = Object.entries(user.profile.dealbreakers)
            .filter(([k, v]) => v && v !== '')
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          if (dealbreakers) {
            console.log(`     - Dealbreakers: ${dealbreakers}`);
          }
        }
        
        // Optional
        if (user.profile.optional) {
          const optional = [];
          if (user.profile.optional.education) optional.push(`Education: ${user.profile.optional.education}`);
          if (user.profile.optional.profession) optional.push(`Profession: ${user.profile.optional.profession}`);
          if (user.profile.optional.languages?.length > 0) optional.push(`Languages: ${user.profile.optional.languages.join(', ')}`);
          if (user.profile.optional.horoscope) optional.push(`Horoscope: ${user.profile.optional.horoscope}`);
          if (optional.length > 0) {
            console.log(`     - Optional: ${optional.join(', ')}`);
          }
        }
      } else {
        console.log(`   📋 Profile: Not created yet`);
      }
      console.log('');
    });

    // Get interactions
    const interactions = await Interaction.find({})
      .populate('fromUser', 'phone')
      .populate('toUser', 'phone')
      .sort({ createdAt: -1 })
      .limit(20);

    if (interactions.length > 0) {
      console.log('💝 Recent Interactions:\n');
      interactions.forEach((interaction, index) => {
        console.log(`${index + 1}. ${interaction.fromUser?.phone || 'Unknown'} → ${interaction.type.toUpperCase()} → ${interaction.toUser?.phone || 'Unknown'}`);
        console.log(`   Date: ${new Date(interaction.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    // Get matches
    const matches = await Match.find({ isActive: true })
      .populate('users', 'phone')
      .sort({ matchedAt: -1 })
      .limit(20);

    if (matches.length > 0) {
      console.log('💕 Matches:\n');
      matches.forEach((match, index) => {
        const userPhones = match.users.map(u => u.phone).join(' & ');
        console.log(`${index + 1}. Match between: ${userPhones}`);
        console.log(`   Matched at: ${new Date(match.matchedAt).toLocaleString()}`);
        console.log(`   Match ID: ${match._id}`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

viewDatabase();



