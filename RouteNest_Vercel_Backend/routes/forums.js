const express = require("express");
const { getStore, nextId } = require("../data/store");

const router = express.Router();

/* ── GET /api/forums ──────────────────────────────────────── */
router.get("/", (_req, res) => {
  const { forums } = getStore();
  // Return forums with topic counts and activity
  const forumsSummary = forums.map((forum) => ({
    ...forum,
    topicCount: forum.topics.length
  }));
  res.json(forumsSummary);
});

/* ── GET /api/forums/:slug ───────────────────────────────── */
router.get("/:slug", (req, res) => {
  const { forums } = getStore();
  const forum = forums.find((f) => f.slug === req.params.slug);
  if (!forum) {
    return res.status(404).json({ error: "Forum not found." });
  }
  res.json(forum);
});

/* ── GET /api/forums/:forumSlug/topics ──────────────────── */
router.get("/:forumSlug/topics", (req, res) => {
  const { forums } = getStore();
  const forum = forums.find((f) => f.slug === req.params.forumSlug);
  if (!forum) {
    return res.status(404).json({ error: "Forum not found." });
  }

  // Sort topics by recent activity
  const sortedTopics = [...forum.topics].sort((a, b) => 
    new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
  );

  res.json(sortedTopics);
});

/* ── GET /api/forums/:forumSlug/topics/:topicSlug ────────── */
router.get("/:forumSlug/topics/:topicSlug", (req, res) => {
  const { forums, posts } = getStore();
  const forum = forums.find((f) => f.slug === req.params.forumSlug);
  if (!forum) {
    return res.status(404).json({ error: "Forum not found." });
  }

  const topic = forum.topics.find((t) => t.slug === req.params.topicSlug);
  if (!topic) {
    return res.status(404).json({ error: "Topic not found." });
  }

  // Return topic details with related posts
  const topicPosts = posts.filter(
    (p) => !p.removed && p.topic.toLowerCase().includes(topic.slug)
  );

  res.json({
    ...topic,
    posts: topicPosts.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  });
});

/* ── POST /api/forums/:forumSlug/topics/:topicSlug/discuss ─ */
router.post("/:forumSlug/topics/:topicSlug/discuss", (req, res) => {
  const { forums, posts } = getStore();
  const forum = forums.find((f) => f.slug === req.params.forumSlug);
  if (!forum) {
    return res.status(404).json({ error: "Forum not found." });
  }

  const topic = forum.topics.find((t) => t.slug === req.params.topicSlug);
  if (!topic) {
    return res.status(404).json({ error: "Topic not found." });
  }

  const { title, body, author, authorId, verified, photo } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  if (!verified) {
    return res.status(403).json({ error: "Only verified users can create discussion posts." });
  }

  const discussionPost = {
    id: nextId(posts),
    authorId: authorId || 0,
    author: author || "Anonymous",
    verified: verified || false,
    topic: topic.title,
    title: title.trim(),
    body: body.trim(),
    photo: photo || "",
    likes: [],
    comments: [],
    reports: [],
    shares: {
      twitter: 0,
      facebook: 0,
      instagram: 0,
      whatsapp: 0
    },
    forumId: forum.id,
    topicId: topic.id,
    removed: false,
    createdAt: new Date().toISOString()
  };

  posts.unshift(discussionPost);
  topic.postsCount += 1;
  topic.lastActivityAt = new Date().toISOString();

  res.status(201).json(discussionPost);
});

module.exports = router;
