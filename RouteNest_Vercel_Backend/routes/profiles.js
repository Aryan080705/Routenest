const express = require("express");
const { getStore } = require("../data/store");

const router = express.Router();

/* ── GET /api/profiles ────────────────────────────────────── */
router.get("/", (_req, res) => {
  const { userProfiles } = getStore();
  // Return all verified user profiles
  const profiles = userProfiles.filter((p) => p.verified);
  res.json(profiles);
});

/* ── GET /api/profiles/trending ──────────────────────────── */
router.get("/trending", (_req, res) => {
  const { userProfiles } = getStore();
  // Return top contributors sorted by engagement
  const trending = userProfiles
    .filter((p) => p.verified)
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 10);
  res.json(trending);
});

/* ── GET /api/profiles/:userId ───────────────────────────── */
router.get("/:userId", (req, res) => {
  const { userProfiles, posts } = getStore();
  const userId = Number(req.params.userId);
  const profile = userProfiles.find((p) => p.userId === userId);

  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Get user's posts
  const userPosts = posts
    .filter((p) => p.authorId === userId && !p.removed)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calculate engagement stats
  const engagementStats = {
    totalPostLikes: userPosts.reduce((sum, p) => sum + p.likes.length, 0),
    totalComments: userPosts.reduce((sum, p) => sum + p.comments.length, 0),
    totalReports: userPosts.reduce((sum, p) => sum + p.reports.length, 0),
    averageLikesPerPost: userPosts.length > 0 
      ? Math.round(userPosts.reduce((sum, p) => sum + p.likes.length, 0) / userPosts.length)
      : 0
  };

  res.json({
    ...profile,
    recentPosts: userPosts.slice(0, 5),
    engagementStats,
    postCount: userPosts.length
  });
});

/* ── GET /api/profiles/:userId/posts ─────────────────────── */
router.get("/:userId/posts", (req, res) => {
  const { posts, userProfiles } = getStore();
  const userId = Number(req.params.userId);
  
  const profile = userProfiles.find((p) => p.userId === userId);
  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  const userPosts = posts
    .filter((p) => p.authorId === userId && !p.removed)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userPosts);
});

/* ── POST /api/profiles/:userId/follow ───────────────────── */
router.post("/:userId/follow", (req, res) => {
  const { userProfiles } = getStore();
  const userId = Number(req.params.userId);
  const profile = userProfiles.find((p) => p.userId === userId);

  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Simulate following
  if (!profile.followers) {
    profile.followers = [];
  }

  const followerUserId = req.body.followerUserId;
  if (!followerUserId) {
    return res.status(400).json({ error: "followerUserId is required." });
  }

  if (!profile.followers.includes(followerUserId)) {
    profile.followers.push(followerUserId);
    profile.followersCount += 1;
  }

  res.json({
    userId,
    followersCount: profile.followersCount,
    message: "User followed successfully."
  });
});

/* ── POST /api/profiles/:userId/unfollow ─────────────────── */
router.post("/:userId/unfollow", (req, res) => {
  const { userProfiles } = getStore();
  const userId = Number(req.params.userId);
  const profile = userProfiles.find((p) => p.userId === userId);

  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  if (!profile.followers) {
    profile.followers = [];
  }

  const followerUserId = req.body.followerUserId;
  if (!followerUserId) {
    return res.status(400).json({ error: "followerUserId is required." });
  }

  const idx = profile.followers.indexOf(followerUserId);
  if (idx > -1) {
    profile.followers.splice(idx, 1);
    profile.followersCount = Math.max(0, profile.followersCount - 1);
  }

  res.json({
    userId,
    followersCount: profile.followersCount,
    message: "User unfollowed successfully."
  });
});

/* ── PUT /api/profiles/:userId ───────────────────────────── */
router.put("/:userId", (req, res) => {
  const { userProfiles } = getStore();
  const userId = Number(req.params.userId);
  const profile = userProfiles.find((p) => p.userId === userId);

  if (!profile) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Allow updating bio, avatar, and social links
  if (req.body.bio !== undefined) profile.bio = req.body.bio;
  if (req.body.avatar !== undefined) profile.avatar = req.body.avatar;
  if (req.body.socialLinks !== undefined) {
    profile.socialLinks = { ...profile.socialLinks, ...req.body.socialLinks };
  }

  res.json(profile);
});

/* ── POST /api/profiles/:userId/verify ──────────────────────── */
router.post("/:userId/verify", (req, res) => {
  const { userProfiles, users } = getStore();
  const userId = Number(req.params.userId);
  
  const profile = userProfiles.find((p) => p.userId === userId);
  const user = users.find((u) => u.id === userId);

  if (!profile || !user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Auto-verify for demo purposes
  profile.verified = true;
  user.verified = true;

  res.json({ message: "Verification successful.", verified: true });
});

/* ── POST /api/profiles/:userId/trust ──────────────────────── */
router.post("/:userId/trust", (req, res) => {
  const { userProfiles, users } = getStore();
  const userId = Number(req.params.userId);
  
  const profile = userProfiles.find((p) => p.userId === userId);
  const user = users.find((u) => u.id === userId);

  if (!profile || !user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!profile.verified) {
    return res.status(403).json({ error: "Only verified users can become Trusted Reviewers." });
  }

  // Auto-approve for demo purposes
  profile.trustedReviewer = true;
  user.trustedReviewer = true;

  res.json({ message: "Trusted Reviewer approval successful.", trustedReviewer: true });
});

module.exports = router;
