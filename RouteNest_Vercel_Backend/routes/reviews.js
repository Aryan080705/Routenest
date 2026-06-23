/**
 * Reviews routes patched with Trusted Reviewer logic.
 *
 * Rule (matches the FastAPI implementation):
 *   After any helpful-vote on a review, sum the `helpful` counter across
 *   every visible review whose author is the same user. If that sum is
 *   ≥ TRUSTED_THRESHOLD (default 5), set `user.trustedReviewer = true`.
 *
 * Each review payload is enriched with `trustedReviewer: boolean` so the
 * frontend can render the badge without a second lookup.
 */
const express = require("express");
const { getStore, nextId } = require("../data/store");
const {
  requireFields,
  validateRating,
  validateMinLength,
} = require("../utils/validators");

const router = express.Router();
const TRUSTED_THRESHOLD = 5;

function findUserById(id) {
  return getStore().users.find((u) => u.id === id) || null;
}
function findUserByName(name) {
  const n = String(name || "").trim().toLowerCase();
  return getStore().users.find((u) => String(u.name).toLowerCase() === n) || null;
}
function authorOf(review) {
  return findUserById(review.userId) || findUserByName(review.user);
}
function enrich(review) {
  const author = authorOf(review);
  return { ...review, trustedReviewer: !!(author && author.trustedReviewer) };
}
function recomputeTrustedFor(userId) {
  const user = findUserById(userId);
  if (!user) return { total: 0, trusted: false };
  const { reviews } = getStore();
  const total = reviews
    .filter((r) => !r.hidden && (r.userId === userId ||
      String(r.user || "").toLowerCase() === String(user.name).toLowerCase()))
    .reduce((sum, r) => sum + (r.helpful || 0), 0);
  if (total >= TRUSTED_THRESHOLD) user.trustedReviewer = true;
  return { total, trusted: !!user.trustedReviewer };
}

/* GET /api/reviews — supports ?userId=<id> to filter to that author */
router.get("/", (req, res) => {
  const { reviews, users } = getStore();
  let items = reviews.filter((r) => !r.hidden);
  const uid = req.query.userId ? Number(req.query.userId) : null;
  if (Number.isFinite(uid)) {
    const u = users.find((x) => x.id === uid);
    const uname = (u?.name || "").toLowerCase();
    items = items.filter(
      (r) => r.userId === uid || (uname && String(r.user || "").toLowerCase() === uname)
    );
  }
  res.json(items.map(enrich));
});

/* GET /api/reviews/stats — unchanged */
router.get("/stats", (_req, res) => {
  const { reviews } = getStore();
  const visible = reviews.filter((r) => !r.hidden);
  const avg = visible.length ? visible.reduce((s, r) => s + r.rating, 0) / visible.length : 0;
  res.json({
    total: visible.length,
    averageRating: Math.round(avg * 10) / 10,
    fiveStars: visible.filter((r) => r.rating === 5).length,
    fourStars: visible.filter((r) => r.rating === 4).length,
    threeStars: visible.filter((r) => r.rating === 3).length,
    twoStars: visible.filter((r) => r.rating === 2).length,
    oneStar: visible.filter((r) => r.rating === 1).length,
  });
});

/* POST /api/reviews — requires auth */
router.post("/", (req, res) => {
  // Get user from auth token
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions, reviews } = getStore();
  const userId = sessions[token];
  const user = userId ? users.find((u) => u.id === userId) : null;
  
  if (!user) return res.status(401).json({ error: "Unauthorized. Please log in." });
  if (!user.verified) return res.status(403).json({ error: "Only verified users can submit reviews." });

  const body = req.body;
  if (!body.completedJourney) return res.status(403).json({ error: "Reviews are allowed only after a completed journey." });
  const fieldErr = requireFields(body, ["route", "rating", "text", "journeyId"]);
  if (fieldErr) return res.status(400).json({ error: fieldErr });
  const ratingErr = validateRating(body.rating);
  if (ratingErr) return res.status(400).json({ error: ratingErr });
  const lenErr = validateMinLength(body.text, 30, "Review");
  if (lenErr) return res.status(400).json({ error: lenErr });

  const dup = reviews.find((r) =>
    r.user.toLowerCase() === user.name.toLowerCase() &&
    r.route.toLowerCase() === body.route.toLowerCase() &&
    String(r.journeyId).toLowerCase() === String(body.journeyId).toLowerCase() &&
    !r.hidden);
  if (dup) return res.status(409).json({ error: "You already reviewed this route for this journey." });

  const review = {
    id: nextId(reviews),
    route: body.route.trim(),
    journeyId: String(body.journeyId).trim(),
    user: user.name,
    userId: user.id,
    verified: true,
    completedJourney: true,
    rating: Number(body.rating),
    text: body.text.trim(),
    helpful: 0,
    helpfulBy: [],
    reports: 0,
    hidden: false,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  res.status(201).json(enrich(review));
});


/* PATCH /api/reviews/:id — edit own review text (within 24 h) */
router.patch("/:id", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions, reviews } = getStore();
  const userId = sessions[token];
  const user = userId ? users.find((u) => u.id === userId) : null;
  if (!user) return res.status(401).json({ error: "Unauthorized. Please log in." });

  const review = reviews.find((r) => r.id === Number(req.params.id) && !r.hidden);
  if (!review) return res.status(404).json({ error: "Review not found." });

  // Only the author can edit
  if (review.userId !== user.id && review.user.toLowerCase() !== user.name.toLowerCase()) {
    return res.status(403).json({ error: "You can only edit your own reviews." });
  }

  // Enforce 24-hour edit window
  const ageMs = Date.now() - new Date(review.createdAt).getTime();
  if (ageMs > 24 * 3600 * 1000) {
    return res.status(403).json({ error: "Reviews can only be edited within 24 hours of posting." });
  }

  const { text, rating } = req.body;
  if (!text || text.trim().length < 30) {
    return res.status(400).json({ error: "Review text must be at least 30 characters." });
  }
  if (rating !== undefined) {
    const ratingErr = validateRating(Number(rating));
    if (ratingErr) return res.status(400).json({ error: ratingErr });
    review.rating = Number(rating);
  }

  review.text = text.trim();
  review.updatedAt = new Date().toISOString();
  res.json(enrich(review));
});

/* POST /api/reviews/:id/helpful — toggle + recompute trusted */
router.post("/:id/helpful", (req, res) => {
  // We only need a user id to dedupe votes; pull from Bearer token if present.
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions, reviews } = getStore();
  const voterId = sessions[token];
  const voter = voterId ? users.find((u) => u.id === voterId) : null;
  if (!voter) return res.status(401).json({ error: "Unauthorized." });

  const review = reviews.find((r) => r.id === Number(req.params.id) && !r.hidden);
  if (!review) return res.status(404).json({ error: "Review not found." });

  review.helpfulBy = review.helpfulBy || [];
  if (review.helpfulBy.includes(voter.id)) {
    review.helpfulBy = review.helpfulBy.filter((x) => x !== voter.id);
    review.helpful = Math.max(0, (review.helpful || 0) - 1);
  } else {
    review.helpfulBy.push(voter.id);
    review.helpful = (review.helpful || 0) + 1;
  }

  // Recompute trusted status for the review's AUTHOR (not the voter).
  const author = authorOf(review);
  const { total, trusted } = author ? recomputeTrustedFor(author.id) : { total: 0, trusted: false };

  res.json({
    id: review.id,
    helpful: review.helpful,
    voted: review.helpfulBy.includes(voter.id),
    authorTotalHelpful: total,
    authorTrustedReviewer: trusted,
  });
});

/* POST /api/reviews/:id/report — unchanged */
router.post("/:id/report", (req, res) => {
  const { reviews } = getStore();
  const review = reviews.find((r) => r.id === Number(req.params.id) && !r.hidden);
  if (!review) return res.status(404).json({ error: "Review not found." });
  review.reports += 1;
  if (review.reports >= 3) review.hidden = true;
  res.json({ id: review.id, reports: review.reports, hidden: review.hidden });
});

module.exports = router;

/* ── Mongoose variant ────────────────────────────────────────────────
const User = require("../models/User");
const Review = require("../models/Review");

async function recomputeTrustedFor(userId) {
  const agg = await Review.aggregate([
    { $match: { hidden: false, userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$userId", total: { $sum: "$helpful" } } },
  ]);
  const total = agg[0]?.total || 0;
  if (total >= 5) {
    await User.updateOne({ _id: userId }, { trustedReviewer: true });
  }
  return total;
}

router.post("/:id/helpful", async (req, res) => {
  const voter = await authFromReq(req);
  if (!voter) return res.status(401).json({ error: "Unauthorized." });
  const review = await Review.findById(req.params.id);
  if (!review || review.hidden) return res.status(404).json({ error: "Review not found." });
  const idx = review.helpfulBy.findIndex((x) => String(x) === String(voter._id));
  if (idx >= 0) { review.helpfulBy.splice(idx, 1); review.helpful = Math.max(0, review.helpful - 1); }
  else { review.helpfulBy.push(voter._id); review.helpful += 1; }
  await review.save();
  const total = await recomputeTrustedFor(review.userId);
  const author = await User.findById(review.userId).lean();
  res.json({ id: review._id, helpful: review.helpful, authorTotalHelpful: total, authorTrustedReviewer: !!author?.trustedReviewer });
});
────────────────────────────────────────────────────────────────────── */
