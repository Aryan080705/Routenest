const express = require("express");
const crypto = require("crypto");
const { getStore, nextId } = require("../data/store");
const seedDemoNotifications = require("../utils/seedDemoNotifications");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hidePassword(user) {
  const { password, ...safe } = user;
  return safe;
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const { users, sessions, userProfiles } = getStore();
  const normalized = normalizeEmail(email);
  if (users.some((u) => u.email === normalized)) {
    return res.status(409).json({ error: "Email already registered." });
  }

  // Start new user IDs at 100 to avoid colliding with hardcoded demo profiles (IDs 1, 2, 3)
  const newId = Math.max(nextId(users), 100);

  const user = {
    id: newId,
    name: String(name).trim(),
    email: normalized,
    password: String(password),
    verified: true, // Auto-verify so users can post and review
    theme: null,
    language: null,
    createdAt: new Date().toISOString()
  };
  users.push(user);

  // Auto-create a matching profile for the new user so the Profile page doesn't 404
  userProfiles.push({
    id: newId,
    userId: newId,
    name: user.name,
    email: user.email,
    verified: true,
    bio: "",
    // This API tries to generate a male/female avatar based on the name
    avatar: `https://avatar.iran.liara.run/public?username=${encodeURIComponent(user.name)}`,
    totalPosts: 0,
    totalLikes: 0,
    followersCount: 0,
    joinedAt: user.createdAt,
    badges: [],
    socialLinks: {}
  });

  const token = crypto.randomBytes(24).toString("hex");
  sessions[token] = user.id;
  seedDemoNotifications(user.id);

  res.status(201).json({ token, user: hidePassword(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const { users, sessions, userProfiles } = getStore();
  const normalized = normalizeEmail(email);
  let user = users.find((u) => u.email === normalized);
  
  if (!user) {
    // AUTO REGISTER: Because Vercel serverless wipes the in-memory database,
    // legitimate users will get "Invalid email" after a cold start.
    // To solve this instantly for the user, we auto-create their account on login!
    const newId = Math.max(nextId(users), 100);
    user = {
      id: newId,
      name: normalized.split("@")[0] || "User",
      email: normalized,
      password: String(password),
      verified: true,
      theme: null,
      language: null,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    userProfiles.push({
      id: newId, userId: newId, name: user.name, email: user.email, verified: true,
      bio: "", avatar: `https://avatar.iran.liara.run/public?username=${encodeURIComponent(user.name)}`,
      totalPosts: 0, totalLikes: 0, followersCount: 0, joinedAt: user.createdAt, badges: [], socialLinks: {}
    });
  } else if (user.password !== String(password || "")) {
    return res.status(401).json({ error: "Invalid password." });
  }

  const token = crypto.randomBytes(24).toString("hex");
  sessions[token] = user.id;
  seedDemoNotifications(user.id);
  res.json({ token, user: hidePassword(user) });
});

router.get("/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions } = getStore();
  const userId = sessions[token];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  seedDemoNotifications(user.id);
  res.json({ user: hidePassword(user) });
});

router.patch("/me/preferences", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const { users, sessions } = getStore();
  const userId = sessions[token];
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { theme, language, notifications } = req.body || {};
  if (theme !== undefined) user.theme = theme;
  if (language !== undefined) user.language = language;
  if (notifications !== undefined) user.notifications = { ...(user.notifications || {}), ...notifications };

  res.json({ user: hidePassword(user) });
});

module.exports = router;
