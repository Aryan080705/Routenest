const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  theme: String,
  language: String,
  notifications: Object,
  createdAt: { type: Date, default: Date.now }
});

const ProfileSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  name: String,
  email: String,
  verified: { type: Boolean, default: false },
  bio: String,
  avatar: String,
  totalPosts: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  badges: [String],
  socialLinks: Object,
  followers: [Number],
  trustedReviewer: Boolean
});

const PostSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  authorId: Number,
  author: String,
  verified: Boolean,
  topic: String,
  title: String,
  body: String,
  photo: String,
  likes: [Number],
  likedAt: Object,
  comments: [{
    id: Number,
    authorId: Number,
    author: String,
    verified: Boolean,
    text: String,
    likes: Number,
    timestamp: Date
  }],
  reports: [Number],
  shares: Object,
  removed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: Number,
  userName: String,
  route: String,
  rating: Number,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: Number,
  type: String,
  title: String,
  body: String,
  channels: [String],
  language: String,
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  readAt: Date,
  metadata: Object
});

const SavedRouteSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: Number,
  name: String,
  start: String,
  destination: String,
  waypoints: [String],
  avoidTolls: Boolean,
  avoidHighways: Boolean,
  distance: Number,
  duration: Number,
  completedJourney: { type: Boolean, default: false },
  savedAt: { type: Date, default: Date.now }
});

// Create auto-increment counter schema to keep IDs simple (numbers) instead of ObjectIds
// Since the frontend relies heavily on numeric IDs, we'll use a simple counter
const CounterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const getNextId = async (modelName) => {
  const counter = await Counter.findByIdAndUpdate(
    modelName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const SavedRoute = mongoose.models.SavedRoute || mongoose.model('SavedRoute', SavedRouteSchema);

module.exports = {
  User, Profile, Post, Review, Notification, SavedRoute, Counter, getNextId
};
