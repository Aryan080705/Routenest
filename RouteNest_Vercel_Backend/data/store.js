/**
 * In-memory data store for RouteNest.
 * Keeps posts, notifications, reviews, user profiles, forums, and moderation data
 * as live arrays so any route module can read/write them without a database.
 */

const initialData = () => ({
  userProfiles: [],
  posts: [],
  forums: [],
  reviews: [],
  userPreferences: {},
  users: [],
  sessions: {},
  savedRoutes: {},
  notificationHistory: [],
  notificationQueue: [],
  deliveryLogs: [],
  notifications: []
});

/* ── live store ─────────────────────────────────────────────── */

let store = initialData();

const addMockData = () => {
  // Mock data disabled to prevent showing dummy posts and reviews
};
// addMockData();

const getStore = () => store;
const setStore = (newData) => { store = newData; };

/** Reset to seed data (useful for testing). */
const resetStore = () => {
  store = initialData();
  addMockData();
};

/** Auto-incrementing ID helper. */
const nextId = (collection) =>
  collection.length > 0
    ? Math.max(...collection.map((item) => item.id)) + 1
    : 1;

module.exports = { getStore, setStore, resetStore, nextId };
