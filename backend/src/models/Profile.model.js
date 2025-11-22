import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Step 1: Basic Info
  name: {
    type: String,
    trim: true
  },
  dob: {
    type: Date
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  customGender: {
    type: String,
    trim: true
  },
  orientation: {
    type: String,
    enum: ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other']
  },
  customOrientation: {
    type: String,
    trim: true
  },
  lookingFor: {
    type: [String],
    enum: ['men', 'women', 'everyone']
  },
  
  // Step 2: Location & Preferences
  location: {
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  ageRange: {
    min: {
      type: Number,
      default: 18,
      min: 18
    },
    max: {
      type: Number,
      default: 100,
      max: 100
    }
  },
  distancePref: {
    type: Number,
    default: 25, // in kilometers
    min: 1,
    max: 100
  },
  
  // Step 3: Interests
  interests: [{
    type: String,
    trim: true
  }],
  
  // Step 4: Personality
  personality: {
    social: {
      type: String,
      enum: ['social', 'introvert', 'extrovert', 'ambivert', '']
    },
    planning: {
      type: String,
      enum: ['planner', 'spontaneous', 'balanced', '']
    },
    romantic: {
      type: String,
      enum: ['romantic', 'practical', 'balanced', '']
    },
    morning: {
      type: String,
      enum: ['morning', 'night', 'morning-person', 'night-owl', 'balanced', '']
    },
    homebody: {
      type: String,
      enum: ['homebody', 'outgoing', 'adventurer', 'balanced', '']
    },
    serious: {
      type: String,
      enum: ['serious', 'casual', 'balanced', '']
    },
    decision: {
      type: String,
      enum: ['quick', 'thoughtful', 'decisive', 'indecisive', 'balanced', '']
    },
    communication: {
      type: String,
      enum: ['direct', 'subtle', 'balanced', '']
    }
  },
  
  // Step 5: Dealbreakers
  dealbreakers: {
    kids: {
      type: String,
      enum: ['want-kids', 'dont-want-kids', 'have-kids', 'not-sure', '']
    },
    smoking: {
      type: String,
      enum: ['non-smoker', 'social-smoker', 'smoker', 'prefer-non-smoker', '']
    },
    pets: {
      type: String,
      enum: ['have-pets', 'love-pets', 'not-interested', '']
    },
    drinking: {
      type: String,
      enum: ['never', 'occasionally', 'socially', 'regularly', '']
    },
    religion: {
      type: String,
      trim: true
    }
  },
  
  // Step 6: Optional
  optional: {
    education: {
      type: String,
      enum: ['high-school', 'diploma', 'bachelors', 'masters', 'phd', '']
    },
    profession: {
      type: String,
      trim: true
    },
    languages: [{
      type: String,
      trim: true
    }],
    horoscope: {
      type: String,
      trim: true
    },
    prompts: [{
      prompt: {
        type: String,
        trim: true
      },
      answer: {
        type: String,
        trim: true
      }
    }]
  },
  
  // Step 7: Photos & Bio
  photos: [{
    url: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String
    },
    isMain: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    }
  }],
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationPhoto: {
    url: String,
    cloudinaryId: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date,
    reviewedAt: Date
  },
  
  // Profile completion
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  // Visibility & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
profileSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for search
profileSchema.index({ name: 'text', bio: 'text', interests: 'text' });

// Calculate age from DOB
profileSchema.methods.calculateAge = function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  this.age = age;
  return age;
};

// Calculate profile completion percentage
profileSchema.methods.calculateCompletion = function() {
  let completedFields = 0;
  let totalFields = 0;
  
  // Basic info (5 fields)
  totalFields += 5;
  if (this.name) completedFields++;
  if (this.dob) completedFields++;
  if (this.gender) completedFields++;
  if (this.orientation) completedFields++;
  if (this.lookingFor && this.lookingFor.length > 0) completedFields++;
  
  // Location (1 field)
  totalFields += 1;
  if (this.location && this.location.city) completedFields++;
  
  // Interests (1 field - at least 3)
  totalFields += 1;
  if (this.interests && this.interests.length >= 3) completedFields++;
  
  // Personality (8 fields)
  totalFields += 8;
  const personality = this.personality || {};
  Object.keys(personality).forEach(key => {
    if (personality[key]) completedFields++;
  });
  
  // Dealbreakers (5 fields)
  totalFields += 5;
  const dealbreakers = this.dealbreakers || {};
  Object.keys(dealbreakers).forEach(key => {
    if (dealbreakers[key]) completedFields++;
  });
  
  // Optional (3 fields)
  totalFields += 3;
  const optional = this.optional || {};
  if (optional.education) completedFields++;
  if (optional.profession) completedFields++;
  if (optional.languages && optional.languages.length > 0) completedFields++;
  
  // Photos (1 field - at least 4)
  totalFields += 1;
  if (this.photos && this.photos.length >= 4) completedFields++;
  
  // Bio (1 field)
  totalFields += 1;
  if (this.bio && this.bio.trim().length > 0) completedFields++;
  
  this.completionPercentage = Math.round((completedFields / totalFields) * 100);
  return this.completionPercentage;
};

// Pre-save middleware to calculate age and completion
profileSchema.pre('save', function(next) {
  if (this.dob) {
    this.calculateAge();
  }
  this.calculateCompletion();
  next();
});

export default mongoose.model('Profile', profileSchema);

