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
  notifications: [],
  moderationQueue: []
});

/* ── live store ─────────────────────────────────────────────── */

let store = initialData();

const addMockData = () => {
  const dummyData = [
    { name: 'Karan Malhotra', title: 'Road condition on NH48?', body: 'Does anyone know if the construction near Surat on NH48 is complete? Planning a trip to Mumbai next week.', topic: 'questions' },
    { name: 'Riya Sen', title: 'Amazing trip to Spiti Valley', body: 'Just came back from a 10 day road trip to Spiti. The roads are tough but the views are totally worth it! Make sure you carry enough fuel.', topic: 'travelogues' },
    { name: 'Tarun Bajaj', title: 'Best dhabas on Delhi-Chandigarh highway', body: 'I always stop at Amrik Sukhdev, but are there any hidden gems for parathas on this route?', topic: 'food' },
    { name: 'Simran Kaur', title: 'Fog alert: Yamuna Expressway', body: 'Heavy fog on the Yamuna Expressway this morning. Visibility is less than 50 meters. Drive slow!', topic: 'alerts' },
    { name: 'Arjun Nair', title: 'Is it safe to drive to Goa at night?', body: 'Planning to leave Pune around 8 PM. Is the Amboli ghat section safe for night driving?', topic: 'questions' },
    { name: 'Divya Sharma', title: 'Hidden waterfall near Lonavala', body: 'Found a pristine waterfall just 10km off the main highway. The trail is completely empty. Highly recommended.', topic: 'travelogues' },
    { name: 'Mohit Agarwal', title: 'Traffic jam at Peenya, Bangalore', body: 'Huge pileup at Peenya junction right now. Avoid the highway if you are heading towards Tumkur.', topic: 'alerts' },
    { name: 'Neha Singh', title: 'Car breakdown assistance needed', body: 'My car broke down near Jaipur highway. Does anyone have the number for a reliable towing service here?', topic: 'questions' },
    { name: 'Kunal Kapoor', title: 'Best route for Bangalore to Ooty', body: 'Should I take the Mysore road or the Kanakapura road? Heard Mysore road is full of diversions.', topic: 'questions' },
    { name: 'Aarti Desai', title: 'Monsoon driving tips', body: 'Always check your wiper blades and tires before a monsoon trip. The western ghats can get very slippery.', topic: 'travelogues' },
    { name: 'Varun Dhawan', title: 'Heavy rain on Mumbai-Pune Expressway', body: 'It is pouring heavily on the expressway. Traffic is moving very slowly near Lonavala.', topic: 'alerts' },
    { name: 'Megha Reddy', title: 'Must-visit cafe in Pondicherry', body: 'If you are driving to Pondi, do not miss the Coromandel Cafe. Their desserts are out of this world!', topic: 'food' }
  ];

  dummyData.forEach((d, i) => {
    store.users.push({ id: 1000 + i, name: d.name, email: `dummy${i}@example.com`, verified: true });
    store.posts.push({
      id: 1000 + i,
      authorId: 1000 + i,
      author: d.name,
      title: d.title,
      body: d.body,
      topic: d.topic,
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      verified: true
    });
  });

  // Dummy reports
  ['spam', 'harassment', 'inappropriate'].forEach((reason, i) => {
    store.moderationQueue.push({
      id: 2000 + i,
      postId: 1000 + i,
      reportedBy: 1000 + (i + 5),
      reason: reason,
      description: `User reported post as ${reason}`,
      reportedAt: new Date().toISOString(),
      status: "pending",
      reviewedBy: null,
      action: null
    });
  });
};
addMockData();

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
