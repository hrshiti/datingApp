import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Profile from './src/models/Profile.model.js';
import { Interaction, Match } from './src/models/Interaction.model.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Dummy data arrays
const names = ['Priya', 'Rahul', 'Ananya', 'Arjun', 'Kavya', 'Vikram', 'Sneha', 'Rohan', 'Meera', 'Aditya'];
const cities = [
  { name: 'Mumbai', coordinates: [72.8777, 19.0760] },
  { name: 'Delhi', coordinates: [77.2090, 28.6139] },
  { name: 'Bangalore', coordinates: [77.5946, 12.9716] },
  { name: 'Hyderabad', coordinates: [78.4867, 17.3850] },
  { name: 'Chennai', coordinates: [80.2707, 13.0827] },
  { name: 'Pune', coordinates: [73.8567, 18.5204] },
  { name: 'Kolkata', coordinates: [88.3639, 22.5726] },
  { name: 'Jaipur', coordinates: [75.7873, 26.9124] }
];

const interests = [
  'Travel', 'Music', 'Cooking', 'Photography', 'Yoga', 'Fitness', 'Reading', 
  'Movies', 'Dancing', 'Art', 'Writing', 'Sports', 'Gaming', 'Trekking', 
  'Camping', 'Meditation', 'Fashion', 'Food', 'Technology', 'Nature'
];

const personalityTraits = {
  social: ['social', 'introvert', 'extrovert', 'ambivert'],
  planning: ['planner', 'spontaneous', 'balanced'],
  romantic: ['romantic', 'practical', 'balanced'],
  morning: ['morning', 'night', 'morning-person', 'night-owl', 'balanced'],
  homebody: ['homebody', 'outgoing', 'adventurer', 'balanced'],
  serious: ['serious', 'casual', 'balanced', 'fun-loving', 'fun'],
  decision: ['quick', 'thoughtful', 'decisive', 'indecisive', 'balanced', 'decision-maker', 'go-with-flow'],
  communication: ['direct', 'subtle', 'balanced']
};

const dealbreakerOptions = {
  kids: ['want-kids', 'dont-want-kids', 'have-kids', 'not-sure'],
  smoking: ['smoker', 'non-smoker', 'social-smoker', 'prefer-non-smoker'],
  pets: ['love-pets', 'have-pets', 'allergic', 'not-interested'],
  drinking: ['never', 'occasionally', 'socially', 'regularly']
};

const languages = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];

const prompts = [
  "What's the best way to ask you out?",
  "I'm a great +1 for...",
  "The way to my heart is...",
  "My simple pleasures...",
  "I'll fall for you if...",
  "We'll get along if...",
  "I'm weirdly attracted to...",
  "The most spontaneous thing I've done...",
  "My biggest fear...",
  "I'm looking for..."
];

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Create dummy users and profiles
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Interaction.deleteMany({});
    await Match.deleteMany({});
    console.log('✅ Cleared existing data\n');

    const createdUsers = [];
    const createdProfiles = [];

    // Create 20 dummy users
    for (let i = 0; i < 20; i++) {
      const name = names[i % names.length] + (i > 9 ? ` ${Math.floor(i / 10)}` : '');
      const phone = `9876543${String(i).padStart(3, '0')}`;
      const gender = i % 2 === 0 ? 'female' : 'male';
      const city = getRandomItem(cities);
      
      // Create user
      const user = await User.create({
        phone: phone,
        countryCode: '+91',
        isPhoneVerified: true,
        isVerified: true,
        lastActiveAt: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()), // Last 7 days
        isActive: true
      });
      createdUsers.push(user);

      // Calculate DOB (age between 22-35)
      const age = 22 + Math.floor(Math.random() * 14);
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - age);

      // Create profile
      const profile = await Profile.create({
        userId: user._id,
        name: name,
        dob: dob,
        age: age,
        gender: gender,
        orientation: getRandomItem(['straight', 'bisexual', 'pansexual']),
        lookingFor: gender === 'female' ? ['men'] : ['women'],
        location: {
          city: city.name,
          coordinates: {
            type: 'Point',
            coordinates: city.coordinates
          }
        },
        ageRange: {
          min: 22,
          max: 35
        },
        distancePref: 25 + Math.floor(Math.random() * 50),
        interests: getRandomItems(interests, 5 + Math.floor(Math.random() * 5)),
        personality: {
          social: getRandomItem(personalityTraits.social),
          planning: getRandomItem(personalityTraits.planning),
          romantic: getRandomItem(personalityTraits.romantic),
          morning: getRandomItem(personalityTraits.morning),
          homebody: getRandomItem(personalityTraits.homebody),
          serious: getRandomItem(personalityTraits.serious),
          decision: getRandomItem(personalityTraits.decision),
          communication: getRandomItem(personalityTraits.communication)
        },
        dealbreakers: {
          kids: getRandomItem(dealbreakerOptions.kids),
          smoking: getRandomItem(dealbreakerOptions.smoking),
          pets: getRandomItem(dealbreakerOptions.pets),
          drinking: getRandomItem(dealbreakerOptions.drinking),
          religion: Math.random() > 0.5 ? 'Hindu' : ''
        },
        optional: {
          education: getRandomItem(['high-school', 'bachelors', 'masters', 'phd', '']),
          profession: Math.random() > 0.3 ? `Profession ${i}` : '',
          languages: getRandomItems(languages, 2 + Math.floor(Math.random() * 3)),
          horoscope: Math.random() > 0.5 ? 'Aries' : '',
          prompts: getRandomItems(prompts, 3).map(prompt => ({
            prompt: prompt,
            answer: `Sample answer for ${prompt}`
          }))
        },
        photos: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, (_, idx) => ({
          url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000 + idx}?w=400`,
          cloudinaryId: `dummy_${i}_${idx}`,
          isMain: idx === 0,
          order: idx
        })),
        bio: `Hi! I'm ${name}, ${age} years old from ${city.name}. Love ${getRandomItems(interests, 2).join(' and ')}. Looking for someone special!`,
        completionPercentage: 80 + Math.floor(Math.random() * 20),
        onboardingCompleted: true,
        isActive: true,
        isVisible: true
      });

      // Link profile to user
      user.profile = profile._id;
      await user.save();

      createdProfiles.push(profile);
      console.log(`✅ Created user ${i + 1}/20: ${name} (${phone})`);
    }

    console.log('\n✅ Created 20 users and profiles\n');

    // Create some interactions for testing matches
    console.log('🔗 Creating test interactions...\n');
    
    // User 0 likes User 1, User 2, User 3
    if (createdUsers[0] && createdUsers[1]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[1]._id,
        type: 'like'
      });
    }
    if (createdUsers[0] && createdUsers[2]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[2]._id,
        type: 'like'
      });
    }
    if (createdUsers[0] && createdUsers[3]) {
      await Interaction.create({
        fromUser: createdUsers[0]._id,
        toUser: createdUsers[3]._id,
        type: 'pass'
      });
    }

    // User 1 likes User 0 back (MATCH!)
    if (createdUsers[1] && createdUsers[0]) {
      await Interaction.create({
        fromUser: createdUsers[1]._id,
        toUser: createdUsers[0]._id,
        type: 'like'
      });
      
      // Create match
      await Match.create({
        users: [createdUsers[0]._id, createdUsers[1]._id],
        matchedAt: new Date(),
        isActive: true
      });
      console.log('✅ Created match between User 0 and User 1');
    }

    // User 2 likes User 0 back (MATCH!)
    if (createdUsers[2] && createdUsers[0]) {
      await Interaction.create({
        fromUser: createdUsers[2]._id,
        toUser: createdUsers[0]._id,
        type: 'like'
      });
      
      // Create match
      await Match.create({
        users: [createdUsers[0]._id, createdUsers[2]._id],
        matchedAt: new Date(),
        isActive: true
      });
      console.log('✅ Created match between User 0 and User 2');
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Profiles: ${createdProfiles.length}`);
    console.log(`   - Interactions: ${await Interaction.countDocuments()}`);
    console.log(`   - Matches: ${await Match.countDocuments()}\n`);
    console.log('🧪 Test Accounts:');
    console.log('   - Phone: 9876543000 (User 0 - has 2 matches)');
    console.log('   - Phone: 9876543001 (User 1 - matched with User 0)');
    console.log('   - Phone: 9876543002 (User 2 - matched with User 0)\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

runSeed();

