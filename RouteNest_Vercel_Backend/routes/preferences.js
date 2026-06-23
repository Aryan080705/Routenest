const express = require("express");
const { getStore } = require("../data/store");

const router = express.Router();

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function normalizeLanguage(language) {
  return ["en", "hi", "es"].includes(language) ? language : "en";
}

function normalizePrefs(input = {}) {
  return {
    language: normalizeLanguage(input.language),
    theme: normalizeTheme(input.theme),
    notificationPrefs: {
      email: Boolean(input.notificationPrefs?.email ?? true),
      push: Boolean(input.notificationPrefs?.push ?? true),
      promo: Boolean(input.notificationPrefs?.promo ?? false)
    }
  };
}

router.get("/:userId", (req, res) => {
  const userId = String(req.params.userId || "").trim();
  if (!userId) return res.status(400).json({ error: "userId is required." });

  const { userPreferences } = getStore();
  const prefs = userPreferences[userId];
  if (!prefs) {
    return res.status(404).json({ error: "Preferences not found." });
  }
  res.json({ userId, ...prefs });
});

router.put("/:userId", (req, res) => {
  const userId = String(req.params.userId || "").trim();
  if (!userId) return res.status(400).json({ error: "userId is required." });

  const { userPreferences } = getStore();
  userPreferences[userId] = normalizePrefs(req.body || {});
  res.json({ userId, ...userPreferences[userId] });
});

module.exports = router;
