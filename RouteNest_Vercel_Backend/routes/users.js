/**
 * PUT /api/users/me/theme — persist theme preference for the logged-in user.
 * Mount in app.js:  app.use("/api/users", require("./routes/users"));
 */
const express = require("express");
const { getStore } = require("../data/store");
// If migrating to MongoDB, swap the in-memory lookup with: const User = require("../models/User");

const router = express.Router();

function getUserFromAuth(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions } = getStore();
  const userId = sessions[token];
  if (!userId) return null;
  return users.find((u) => u.id === userId) || null;
}

// In-memory implementation (works with current store.js).
router.put("/me/theme", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { theme } = req.body || {};
  if (theme !== "light" && theme !== "dark") {
    return res.status(400).json({ error: "theme must be 'light' or 'dark'" });
  }
  user.theme = theme;
  res.json({ theme: user.theme });
});

router.put("/me/language", (req, res) => {
  const user = getUserFromAuth(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { language } = req.body || {};
  if (!["en", "hi", "es"].includes(language)) {
    return res.status(400).json({ error: "language must be 'en', 'hi' or 'es'" });
  }
  user.language = language;
  res.json({ language: user.language });
});

/*
// MongoDB version (uncomment when wiring up Mongoose):
router.put("/me/theme", async (req, res) => {
  const user = getUserFromAuth(req); // or use a real JWT middleware
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { theme } = req.body || {};
  if (theme !== "light" && theme !== "dark") {
    return res.status(400).json({ error: "theme must be 'light' or 'dark'" });
  }
  const updated = await User.findByIdAndUpdate(user._id, { theme }, { new: true });
  res.json({ theme: updated.theme });
});
*/

module.exports = router;
