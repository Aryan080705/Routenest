const express = require("express");
const { getStore, nextId } = require("../data/store");
const {
  requireFields,
  validateRating,
  validateMinLength
} = require("../utils/validators");

const router = express.Router();

/* ── GET /api/reviews ────────────────────────────────────── */
router.get("/", (_req, res) => {
  const { reviews } = getStore();
  res.json(reviews.filter((r) => !r.hidden));
});

/* ── GET /api/reviews/stats ──────────────────────────────── */
router.get("/stats", (_req, res) => {
  const { reviews } = getStore();
  const visible = reviews.filter((r) => !r.hidden);
  const average =
    visible.length > 0
      ? visible.reduce((sum, r) => sum + r.rating, 0) / visible.length
      : 0;

  res.json({
    total: visible.length,
    averageRating: Math.round(average * 10) / 10,
    fiveStars: visible.filter((r) => r.rating === 5).length,
    fourStars: visible.filter((r) => r.rating === 4).length,
    threeStars: visible.filter((r) => r.rating === 3).length,
    twoStars: visible.filter((r) => r.rating === 2).length,
    oneStar: visible.filter((r) => r.rating === 1).length
  });
});

/* ── POST /api/reviews ───────────────────────────────────── */
router.post("/", (req, res) => {
  const body = req.body;

  // Must have completed the journey
  if (!body.completedJourney) {
    return res
      .status(403)
      .json({ error: "Reviews are allowed only after a completed journey." });
  }

  // Required fields
  const fieldErr = requireFields(body, ["route", "user", "rating", "text"]);
  if (fieldErr) return res.status(400).json({ error: fieldErr });

  // Rating 1–5
  const ratingErr = validateRating(body.rating);
  if (ratingErr) return res.status(400).json({ error: ratingErr });

  // Minimum 30 characters
  const lenErr = validateMinLength(body.text, 30, "Review");
  if (lenErr) return res.status(400).json({ error: lenErr });

  const { reviews } = getStore();

  // One review per user per route
  const duplicate = reviews.find(
    (r) =>
      r.user.toLowerCase() === body.user.toLowerCase() &&
      r.route.toLowerCase() === body.route.toLowerCase() &&
      !r.hidden
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "You already reviewed this route for this journey." });
  }

  const review = {
    id: nextId(reviews),
    route: body.route.trim(),
    user: body.user.trim(),
    verified: !!body.verified,
    completedJourney: true,
    rating: Number(body.rating),
    text: body.text.trim(),
    helpful: 0,
    reports: 0,
    hidden: false,
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  res.status(201).json(review);
});

/* ── POST /api/reviews/:id/helpful ───────────────────────── */
router.post("/:id/helpful", (req, res) => {
  const { reviews } = getStore();
  const review = reviews.find((r) => r.id === Number(req.params.id));
  if (!review || review.hidden) {
    return res.status(404).json({ error: "Review not found." });
  }
  review.helpful += 1;
  res.json({ id: review.id, helpful: review.helpful });
});

/* ── POST /api/reviews/:id/report ────────────────────────── */
router.post("/:id/report", (req, res) => {
  const { reviews } = getStore();
  const review = reviews.find((r) => r.id === Number(req.params.id));
  if (!review || review.hidden) {
    return res.status(404).json({ error: "Review not found." });
  }
  review.reports += 1;
  // Auto-hide after 3 reports
  if (review.reports >= 3) {
    review.hidden = true;
  }
  res.json({ id: review.id, reports: review.reports, hidden: review.hidden });
});

module.exports = router;
