/**
 * Post (Community) Mongoose schema.
 * Mirror of the in-memory store shape — drop into /backend/models/Post.js.
 */
const mongoose = require("mongoose");

const ALLOWED_TOPICS = ["routes", "destinations", "travel-tips"];

const LikeEntrySchema = new mongoose.Schema(
  { user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, likedAt: { type: Date, default: Date.now } },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorName: { type: String, required: true },   // denormalized for display
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    photo: { type: String, default: "" },
    topic: { type: String, enum: ALLOWED_TOPICS, default: "travel-tips", index: true },
    likes: { type: [LikeEntrySchema], default: [] },
    commentCount: { type: Number, default: 0 },
    removed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PostSchema.virtual("likeCount").get(function () { return this.likes.length; });

PostSchema.set("toJSON", { virtuals: true });
PostSchema.statics.ALLOWED_TOPICS = ALLOWED_TOPICS;

module.exports = mongoose.model("Post", PostSchema);
