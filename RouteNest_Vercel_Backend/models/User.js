/**
 * User schema with theme persistence.
 * Drop this in /backend/models/User.js in your repo, and connect via /backend/config/db.js.
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    verified: { type: Boolean, default: true, alias: "isVerified" },
    // Theme preference. `null` means "no choice yet — fall back to localStorage/system".
    theme: { type: String, enum: ["light", "dark", null], default: null },
    // Language preference. `null` means "fall back to localStorage/browser".
    language: { type: String, enum: ["en", "hi", "es", null], default: null },
    // Trusted-reviewer badge: earned once total helpful votes across user's reviews ≥ 5.
    trustedReviewer: { type: Boolean, default: false, index: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
