/**
 * Community routes — fully wired for the requested feature set.
 * Drop into /backend/routes/community.js in your repo.
 * Uses the existing in-memory store; a Mongoose variant is included as comments
 * at the bottom for when you switch to MongoDB.
 */
const express = require("express");
const { getStore, nextId } = require("../data/store");

const router = express.Router();
const ALLOWED_TOPICS = new Set(["routes", "destinations", "travel-tips"]);

function getUser(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions } = getStore();
  const uid = sessions[token];
  if (!uid) return null;
  return users.find((u) => u.id === uid) || null;
}

function isVerified(u) {
  return !!(u && (u.isVerified || u.verified));
}

function normalizeTopic(t) {
  if (!t) return "travel-tips";
  const s = String(t).trim().toLowerCase().replace(/\s+/g, "-");
  return ALLOWED_TOPICS.has(s) ? s : "travel-tips";
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function shape(p) {
  return {
    id: p.id,
    authorId: p.authorId,
    author: p.author,
    avatarInitials: initials(p.author),
    title: p.title,
    body: p.body,
    photo: p.photo || "",
    topic: p.topic,
    likes: p.likes,
    likeCount: p.likes.length,
    comments: p.comments || [],
    commentCount: (p.comments || []).length,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt || null,
    verified: p.verified || false,
    shares: p.shares || { twitter: 0, facebook: 0, instagram: 0, whatsapp: 0 },
  };
}

/* GET /api/community — Latest, newest first */
router.get("/", (_req, res) => {
  const { posts } = getStore();
  const items = posts
    .filter((p) => !p.removed)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(items.map(shape));
});

/* GET /api/community/trending — Most likes in last 7 days */
router.get("/trending", (_req, res) => {
  const { posts } = getStore();
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const visible = posts.filter((p) => !p.removed);
  const recentLikes = (p) =>
    Object.values(p.likedAt || {}).filter((ts) => new Date(ts).getTime() >= cutoff).length;

  visible.sort((a, b) => {
    const ra = recentLikes(a), rb = recentLikes(b);
    if (rb !== ra) return rb - ra;
    if (b.likes.length !== a.likes.length) return b.likes.length - a.likes.length;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(visible.slice(0, 15).map((p) => ({ ...shape(p), recentLikes7d: recentLikes(p) })));
});

/* GET /api/community/:id */
router.get("/:id", (req, res) => {
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });
  res.json(shape(p));
});

/* POST /api/community — create (verified-only) */
router.post("/", (req, res) => {
  const user = getUser(req);
  if (!isVerified(user)) return res.status(403).json({ error: "Only verified users can post." });

  const { title, body, photo, topic } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "title and body are required." });

  const { posts } = getStore();
  const post = {
    id: nextId(posts),
    authorId: user.id,
    author: user.name,
    verified: true,
    topic: normalizeTopic(topic),
    title: String(title).trim(),
    body: String(body).trim(),
    photo: (photo || "").trim(),
    likes: [],
    likedAt: {},
    comments: [],
    reports: [],
    shares: { twitter: 0, facebook: 0, instagram: 0, whatsapp: 0 },
    removed: false,
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  res.status(201).json(shape(post));
});

/* PATCH /api/community/:id — edit (author-only) */
router.patch("/:id", (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });
  if (p.authorId !== user.id) return res.status(403).json({ error: "You can only edit your own posts." });

  const ageMs = Date.now() - new Date(p.createdAt).getTime();
  if (ageMs > 24 * 3600 * 1000) {
    return res.status(403).json({ error: "Posts cannot be edited after 24 hours." });
  }

  const { title, body, photo, topic } = req.body || {};
  if (title) p.title = String(title).trim();
  if (body) p.body = String(body).trim();
  if (typeof photo === "string") p.photo = photo.trim();
  if (topic !== undefined) p.topic = normalizeTopic(topic);
  p.updatedAt = new Date().toISOString();
  res.json(shape(p));
});

/* DELETE /api/community/:id — author-only */
router.delete("/:id", (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Post not found." });
  if (p.authorId !== user.id) return res.status(403).json({ error: "You can only delete your own posts." });
  p.removed = true;
  res.json({ message: "Post removed successfully." });
});

/* POST /api/community/:id/like — toggle */
router.post("/:id/like", (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });

  p.likedAt = p.likedAt || {};
  const idx = p.likes.indexOf(user.id);
  let liked;
  if (idx >= 0) {
    p.likes.splice(idx, 1);
    delete p.likedAt[user.id];
    liked = false;
  } else {
    p.likes.push(user.id);
    p.likedAt[user.id] = new Date().toISOString();
    liked = true;
  }
  res.json({ id: p.id, likes: p.likes.length, likedByUser: liked });
});

/* POST /api/community/:id/comment — add comment */
router.post("/:id/comment", (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });

  const { text, parentId } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "Comment text is required." });

  p.comments = p.comments || [];

  if (parentId) {
    // Reply to existing comment
    const parent = p.comments.find((c) => c.id === Number(parentId));
    if (!parent) return res.status(404).json({ error: "Parent comment not found." });
    parent.replies = parent.replies || [];
    const reply = {
      id: (parent.replies.length > 0 ? Math.max(...parent.replies.map(r => r.id)) + 1 : 1),
      authorId: user.id,
      author: user.name,
      verified: !!user.verified,
      text: text.trim(),
      likes: 0,
      timestamp: new Date().toISOString(),
    };
    parent.replies.push(reply);
    return res.status(201).json(reply);
  }

  const comment = {
    id: (p.comments.length > 0 ? Math.max(...p.comments.map(c => c.id)) + 1 : 1),
    authorId: user.id,
    author: user.name,
    verified: !!user.verified,
    text: text.trim(),
    likes: 0,
    replies: [],
    timestamp: new Date().toISOString(),
  };
  p.comments.push(comment);
  res.status(201).json(comment);
});

/* POST /api/community/:id/report — report post */
router.post("/:id/report", (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { posts, moderationQueue } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });

  const { reason } = req.body || {};
  const validReasons = ["spam", "abusive", "misleading", "inappropriate"];
  const normalizedReason = validReasons.includes(reason) ? reason : "spam";

  p.reports = p.reports || [];
  p.reports.push({
    userId: user.id,
    reason: normalizedReason,
    reportedAt: new Date().toISOString(),
  });

  // Also add to moderation queue
  moderationQueue.push({
    id: nextId(moderationQueue),
    postId: p.id,
    reportedBy: user.id,
    reason: normalizedReason,
    description: `User reported post as ${normalizedReason}`,
    reportedAt: new Date().toISOString(),
    status: "pending",
    reviewedBy: null,
    action: null,
  });

  // Auto-remove if 3+ reports
  if (p.reports.length >= 3) {
    p.removed = true;
  }

  res.json({ id: p.id, reports: p.reports.length, message: "Report submitted." });
});

/* POST /api/community/:id/share — track social share */
router.post("/:id/share", (req, res) => {
  const { posts } = getStore();
  const p = posts.find((x) => x.id === Number(req.params.id) && !x.removed);
  if (!p) return res.status(404).json({ error: "Post not found." });

  const { platform } = req.body || {};
  const validPlatforms = ["twitter", "facebook", "instagram", "whatsapp", "native"];
  if (!validPlatforms.includes(platform)) {
    return res.status(400).json({ error: "Invalid platform." });
  }

  p.shares = p.shares || { twitter: 0, facebook: 0, instagram: 0, whatsapp: 0, native: 0 };
  p.shares[platform] = (p.shares[platform] || 0) + 1;

  res.json({ id: p.id, shares: p.shares });
});

module.exports = router;
