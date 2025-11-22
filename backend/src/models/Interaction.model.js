import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'pass', 'superlike'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
interactionSchema.index({ fromUser: 1, toUser: 1 });
interactionSchema.index({ toUser: 1, type: 1 });

// Match schema
const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for matches
matchSchema.index({ users: 1 });
matchSchema.index({ isActive: 1 });

export const Interaction = mongoose.model('Interaction', interactionSchema);
export const Match = mongoose.model('Match', matchSchema);

