/**
 * In-memory data store for RouteNest.
 * Keeps posts, notifications, reviews, user profiles, forums, and moderation data
 * as live arrays so any route module can read/write them without a database.
 */

const initialData = () => ({
  userProfiles: [],
  posts: [],
  forums: [
    {
      id: 1,
      slug: 'routes',
      title: 'Route Discussions',
      description: 'Discuss specific routes, conditions, and alternate paths.',
      emoji: '🛣️',
      topics: [
        { id: 101, slug: 'nh48', title: 'NH48 (Delhi - Mumbai)', description: 'Updates and conditions on NH48.', postsCount: 0, lastActivityAt: new Date().toISOString() },
        { id: 102, slug: 'yamuna-expressway', title: 'Yamuna Expressway', description: 'Weather and traffic updates.', postsCount: 0, lastActivityAt: new Date().toISOString() }
      ]
    },
    {
      id: 2,
      slug: 'destinations',
      title: 'Destinations',
      description: 'Recommendations and tips for places to visit.',
      emoji: '🗺️',
      topics: [
        { id: 201, slug: 'goa', title: 'Goa', description: 'Best places, food, and stays.', postsCount: 0, lastActivityAt: new Date().toISOString() },
        { id: 202, slug: 'manali', title: 'Manali', description: 'Hill station vibes, snow, and trekking.', postsCount: 0, lastActivityAt: new Date().toISOString() }
      ]
    },
    {
      id: 3,
      slug: 'travel-tips',
      title: 'Travel Advice',
      description: 'General advice for road trips and traveling.',
      emoji: '✈️',
      topics: [
        { id: 301, slug: 'packing', title: 'Packing Essentials', description: 'What to bring on long trips.', postsCount: 0, lastActivityAt: new Date().toISOString() },
        { id: 302, slug: 'vehicle-prep', title: 'Vehicle Preparation', description: 'Maintenance and checks before you go.', postsCount: 0, lastActivityAt: new Date().toISOString() }
      ]
    }
  ],
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
    { name: 'Karan Malhotra', title: 'Road condition on NH48?', body: 'Does anyone know if the construction near Surat on NH48 is complete? Planning a trip to Mumbai next week.', topic: 'questions', photo: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80' },
    { name: 'Riya Sen', title: 'Amazing trip to Spiti Valley', body: 'Just came back from a 10 day road trip to Spiti. The roads are tough but the views are totally worth it! Make sure you carry enough fuel.', topic: 'travelogues', photo: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80' },
    { name: 'Tarun Bajaj', title: 'Best dhabas on Delhi-Chandigarh highway', body: 'I always stop at Amrik Sukhdev, but are there any hidden gems for parathas on this route?', topic: 'food', photo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Simran Kaur', title: 'Fog alert: Yamuna Expressway', body: 'Heavy fog on the Yamuna Expressway this morning. Visibility is less than 50 meters. Drive slow!', topic: 'alerts', photo: 'https://images.unsplash.com/photo-1473220464584-6fb0d2e8e0d9?auto=format&fit=crop&w=600&q=80' },
    { name: 'Arjun Nair', title: 'Is it safe to drive to Goa at night?', body: 'Planning to leave Pune around 8 PM. Is the Amboli ghat section safe for night driving?', topic: 'questions', photo: 'https://images.unsplash.com/photo-1483363065839-a9a202bc9219?auto=format&fit=crop&w=600&q=80' },
    { name: 'Divya Sharma', title: 'Hidden waterfall near Lonavala', body: 'Found a pristine waterfall just 10km off the main highway. The trail is completely empty. Highly recommended.', topic: 'travelogues', photo: 'https://images.unsplash.com/photo-1432405972618-fc4087e502dd?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mohit Agarwal', title: 'Traffic jam at Peenya, Bangalore', body: 'Huge pileup at Peenya junction right now. Avoid the highway if you are heading towards Tumkur.', topic: 'alerts', photo: 'https://images.unsplash.com/photo-1502877338535-349e67226417?auto=format&fit=crop&w=600&q=80' },
    { name: 'Neha Singh', title: 'Car breakdown assistance needed', body: 'My car broke down near Jaipur highway. Does anyone have the number for a reliable towing service here?', topic: 'questions', photo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80' },
    { name: 'Kunal Kapoor', title: 'Best route for Bangalore to Ooty', body: 'Should I take the Mysore road or the Kanakapura road? Heard Mysore road is full of diversions.', topic: 'questions', photo: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80' },
    { name: 'Aarti Desai', title: 'Monsoon driving tips', body: 'Always check your wiper blades and tires before a monsoon trip. The western ghats can get very slippery.', topic: 'travelogues', photo: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=600&q=80' },
    { name: 'Varun Dhawan', title: 'Heavy rain on Mumbai-Pune Expressway', body: 'It is pouring heavily on the expressway. Traffic is moving very slowly near Lonavala.', topic: 'alerts', photo: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80' },
    { name: 'Megha Reddy', title: 'Must-visit cafe in Pondicherry', body: 'If you are driving to Pondi, do not miss the Coromandel Cafe. Their desserts are out of this world!', topic: 'food', photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80' },
    { name: 'Ravi Teja', title: 'Road works near Vapi?', body: 'Is the flyover construction near Vapi on NH48 finished?', topic: 'nh48', photo: null },
    { name: 'Sonal Desai', title: 'Best food stops on NH48', body: 'Which dhabas are currently open at night between Delhi and Jaipur?', topic: 'nh48', photo: null },
    { name: 'Vikas Sharma', title: 'Speed limits updated', body: 'Just a heads up, the speed limit has been strictly enforced near the Yamuna Expressway toll.', topic: 'yamuna-expressway', photo: null },
    { name: 'Ankita Singh', title: 'Fog conditions this week', body: 'Visibility is extremely poor in the mornings on the expressway. Drive safe!', topic: 'yamuna-expressway', photo: null },
    { name: 'Rohit K', title: 'What to pack for Spiti?', body: 'Can someone share a packing list for a Spiti Valley trip in October?', topic: 'packing', photo: null },
    { name: 'Priya M', title: 'Tire pressure check', body: 'Always ensure your spare tire is inflated properly before leaving the city.', topic: 'vehicle-prep', photo: null },
    { name: 'Sunil C', title: 'Hidden beaches in South Goa', body: 'Cola beach is a must visit, completely empty and pristine!', topic: 'goa', photo: null },
    { name: 'Megha Reddy', title: 'Best shacks in Anjuna', body: 'Curlies and Shiva Valley are classics, but try the new ones on the north side.', topic: 'goa', photo: null },
    { name: 'Kunal P', title: 'Snow in December?', body: 'When does the first snowfall usually happen in Manali? Planning a Christmas trip.', topic: 'manali', photo: null }
  ];

  dummyData.forEach((d, i) => {
    store.users.push({ id: 1000 + i, name: d.name, email: `dummy${i}@example.com`, verified: true });
    store.posts.push({
      id: 1000 + i,
      authorId: 1000 + i,
      author: d.name,
      title: d.title,
      body: d.body,
      photo: d.photo,
      topic: d.topic,
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      verified: true
    });
  });

  // Update forum topics counts based on initial posts
  store.forums.forEach(f => {
    f.topics.forEach(t => {
      t.postsCount = store.posts.filter(p => p.topic === t.slug).length;
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

module.exports = { getStore, setStore, resetStore, nextId, addMockData };
