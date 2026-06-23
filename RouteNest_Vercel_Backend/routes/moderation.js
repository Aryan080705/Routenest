const express = require("express");
const { getStore } = require("../data/store");

const router = express.Router();

/* ── GET /api/moderation/queue ────────────────────────────── */
router.get("/queue", (_req, res) => {
  const { moderationQueue } = getStore();
  
  // Return pending and recent reports sorted by date
  const sortedQueue = moderationQueue
    .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  const stats = {
    total: sortedQueue.length,
    pending: sortedQueue.filter((r) => r.status === "pending").length,
    approved: sortedQueue.filter((r) => r.status === "approved").length,
    rejected: sortedQueue.filter((r) => r.status === "rejected").length,
    removed: sortedQueue.filter((r) => r.status === "removed").length
  };

  res.json({ stats, reports: sortedQueue });
});

/* ── GET /api/moderation/queue/pending ────────────────────── */
router.get("/queue/pending", (_req, res) => {
  const { moderationQueue, posts } = getStore();
  
  const pending = moderationQueue
    .filter((r) => r.status === "pending")
    .sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));

  // Enrich with post details
  const enrichedReports = pending.map((report) => {
    const post = posts.find((p) => p.id === report.postId);
    return {
      ...report,
      post: post || null
    };
  });

  res.json(enrichedReports);
});

/* ── POST /api/moderation/review ─────────────────────────── */
router.post("/review", (req, res) => {
  const { moderationQueue, posts } = getStore();
  const { reportId, action, reviewedBy, reason } = req.body;

  if (!reportId || !action || !["approve", "reject", "remove"].includes(action)) {
    return res.status(400).json({ 
      error: "reportId, action (approve/reject/remove), and reviewedBy are required." 
    });
  }

  const report = moderationQueue.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  // Update report status
  report.status = action === "remove" ? "removed" : (action === "approve" ? "approved" : "rejected");
  report.reviewedBy = reviewedBy;
  report.action = action;
  report.reviewReason = reason;

  // If action is "remove", mark the post as removed
  if (action === "remove") {
    const post = posts.find((p) => p.id === report.postId);
    if (post) {
      post.removed = true;
    }
  }

  res.json({
    reportId,
    status: report.status,
    message: `Report ${action}d successfully.`
  });
});

/* ── GET /api/moderation/statistics ──────────────────────── */
router.get("/statistics", (_req, res) => {
  const { moderationQueue, posts, userProfiles } = getStore();

  const reportReasons = {};
  moderationQueue.forEach((r) => {
    reportReasons[r.reason] = (reportReasons[r.reason] || 0) + 1;
  });

  const topReportedAuthors = {};
  moderationQueue.forEach((r) => {
    const post = posts.find((p) => p.id === r.postId);
    if (post) {
      topReportedAuthors[post.author] = (topReportedAuthors[post.author] || 0) + 1;
    }
  });

  res.json({
    totalReports: moderationQueue.length,
    totalRemovedPosts: posts.filter((p) => p.removed).length,
    reportsByStatus: {
      pending: moderationQueue.filter((r) => r.status === "pending").length,
      approved: moderationQueue.filter((r) => r.status === "approved").length,
      rejected: moderationQueue.filter((r) => r.status === "rejected").length,
      removed: moderationQueue.filter((r) => r.status === "removed").length
    },
    reportReasons,
    topReportedAuthors: Object.entries(topReportedAuthors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
  });
});

/* ── GET /api/moderation/post/:postId ────────────────────── */
router.get("/post/:postId", (req, res) => {
  const { moderationQueue, posts } = getStore();
  const postId = Number(req.params.postId);

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const reports = moderationQueue.filter((r) => r.postId === postId);

  res.json({
    post,
    reports: reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)),
    reportCount: reports.length
  });
});

/* ── POST /api/moderation/bulk-action ────────────────────── */
router.post("/bulk-action", (req, res) => {
  const { moderationQueue, posts } = getStore();
  const { reportIds, action, reviewedBy } = req.body;

  if (!reportIds || !Array.isArray(reportIds) || !action) {
    return res.status(400).json({ error: "reportIds array and action are required." });
  }

  let updated = 0;
  let removed = 0;

  reportIds.forEach((reportId) => {
    const report = moderationQueue.find((r) => r.id === reportId);
    if (report) {
      report.status = action === "remove" ? "removed" : (action === "approve" ? "approved" : "rejected");
      report.reviewedBy = reviewedBy;
      report.action = action;
      updated++;

      if (action === "remove") {
        const post = posts.find((p) => p.id === report.postId);
        if (post) {
          post.removed = true;
          removed++;
        }
      }
    }
  });

  res.json({
    message: `${updated} reports processed, ${removed} posts removed.`,
    updated,
    removed
  });
});

module.exports = router;
