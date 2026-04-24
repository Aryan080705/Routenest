/**
 * In-memory data store for RouteNest.
 * Keeps posts, notifications, and reviews as live arrays so any
 * route module can read/write them without a database.
 */

const initialData = () => ({
  posts: [
    {
      id: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Routes",
      title: "Night bus from Pune to Goa",
      body: "Book the left-side sleeper seats if you want sunrise views near the ghats.",
      photo:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
      likes: 42,
      comments: [
        "Carry a light jacket.",
        "The food stop near Kolhapur is reliable."
      ],
      reports: 0,
      removed: false,
      createdAt: new Date("2026-04-17T09:00:00").toISOString()
    },
    {
      id: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Travel Advice",
      title: "What helped on my first solo bus trip",
      body: "Save your ticket offline, share live location with family, and keep small cash ready.",
      photo:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      likes: 35,
      comments: ["Great checklist.", "Offline ticket saved me once."],
      reports: 0,
      removed: false,
      createdAt: new Date("2026-04-18T14:30:00").toISOString()
    },
    {
      id: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "Hidden gem stops between Delhi and Jaipur",
      body: "Ask the driver to drop you at Neemrana — the stepwell is worth the detour.",
      photo:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
      likes: 28,
      comments: ["Added to my bucket list!", "How long is the detour?"],
      reports: 0,
      removed: false,
      createdAt: new Date("2026-04-19T11:15:00").toISOString()
    }
  ],

  notifications: [
    {
      id: 1,
      type: "booking",
      channel: "email",
      status: "delivered",
      text: "Booking confirmed for Mumbai to Pune.",
      retries: 0,
      createdAt: new Date("2026-04-17T10:00:00").toISOString()
    },
    {
      id: 2,
      type: "schedule",
      channel: "push",
      status: "retrying",
      text: "Your bus is delayed by 18 minutes.",
      retries: 1,
      createdAt: new Date("2026-04-17T10:12:00").toISOString()
    },
    {
      id: 3,
      type: "reminder",
      channel: "push",
      status: "delivered",
      text: "Journey reminder: boarding starts in 45 minutes.",
      retries: 0,
      createdAt: new Date("2026-04-17T10:20:00").toISOString()
    }
  ],

  reviews: [
    {
      id: 1,
      route: "Mumbai to Pune",
      user: "Aarav Mehta",
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "Clean bus, smooth boarding, and the driver kept stops organized.",
      helpful: 18,
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-17T12:00:00").toISOString()
    },
    {
      id: 2,
      route: "Delhi to Jaipur",
      user: "Maya Shah",
      verified: true,
      completedJourney: true,
      rating: 4,
      text: "Good timing and clear announcements, though the last rest stop was crowded.",
      helpful: 13,
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-18T15:00:00").toISOString()
    }
  ]
});

/* ── live store ─────────────────────────────────────────────── */

let store = initialData();

const getStore = () => store;

/** Reset to seed data (useful for testing). */
const resetStore = () => {
  store = initialData();
};

/** Auto-incrementing ID helper. */
const nextId = (collection) =>
  collection.length > 0
    ? Math.max(...collection.map((item) => item.id)) + 1
    : 1;

module.exports = { getStore, resetStore, nextId };
