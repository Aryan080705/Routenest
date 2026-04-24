const express = require("express");
const { getStore, nextId } = require("../data/store");
const { requireFields } = require("../utils/validators");

const router = express.Router();

/* ── GET /api/community ──────────────────────────────────── */
router.get("/", (_req, res) => {
  const { posts } = getStore();
  res.json(posts.filter((p) => !p.removed));
});

/* ── GET /api/community/:id ──────────────────────────────── */
router.get("/:id", (req, res) => {
  const { posts } = getStore();
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post || post.removed) {
    return res.status(404).json({ error: "Post not found." });
  }
  res.json(post);
});

/* ── POST /api/community ─────────────────────────────────── */
router.post("/", (req, res) => {
  const body = req.body;

  if (!body.verified) {
    return res.status(403).json({ error: "Only verified users can post." });
  }

  const err = requireFields(body, ["title", "body"]);
  if (err) return res.status(400).json({ error: err });

  const { posts } = getStore();

  const post = {
    id: nextId(posts),
    author: body.author || "Verified Traveler",
    verified: true,
    topic: body.topic || "Travel Advice",
    title: body.title.trim(),
    body: body.body.trim(),
    photo: body.photo || "",
    likes: 0,
    comments: [],
    reports: 0,
    removed: false,
    createdAt: new Date().toISOString()
  };

  posts.unshift(post);
  res.status(201).json(post);
});

/* ── POST /api/community/:id/like ────────────────────────── */
router.post("/:id/like", (req, res) => {
  const { posts } = getStore();
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post || post.removed) {
    return res.status(404).json({ error: "Post not found." });
  }
  post.likes += 1;
  res.json({ id: post.id, likes: post.likes });
});

/* ── POST /api/community/:id/comment ─────────────────────── */
router.post("/:id/comment", (req, res) => {
  const { posts } = getStore();
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post || post.removed) {
    return res.status(404).json({ error: "Post not found." });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Comment text is required." });
  }

  post.comments.push(text.trim());
  res.status(201).json({ id: post.id, comments: post.comments });
});

/* ── POST /api/community/:id/report ──────────────────────── */
router.post("/:id/report", (req, res) => {
  const { posts } = getStore();
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post || post.removed) {
    return res.status(404).json({ error: "Post not found." });
  }
  post.reports += 1;
  res.json({ id: post.id, reports: post.reports });
});

/* ── DELETE /api/community/:id ───────────────────────────── */
router.delete("/:id", (req, res) => {
  const { posts } = getStore();
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }
  if (post.reports < 2) {
    return res
      .status(403)
      .json({ error: "Post can only be removed after 2+ reports." });
  }
  post.removed = true;
  res.json({ id: post.id, removed: true });
});

module.exports = router;
