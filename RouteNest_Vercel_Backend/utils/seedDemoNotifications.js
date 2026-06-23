/**
 * Idempotent seeding of 10 demo notifications for a user.
 * Call this from your auth routes (register/login/me) — passing the userId.
 *
 *   const seedDemoNotifications = require("./utils/seedDemoNotifications");
 *   seedDemoNotifications(user.id);
 */
const { getStore, nextId } = require("../data/store");

const DEMO = [
  { type: "booking",         title: "Booking Confirmed ✓",
    body:  "Your bus from Mumbai to Pune is confirmed. Booking ID: #BK00001. Departure: 10:30 PM" },
  { type: "journeyReminder", title: "Journey Reminder 🚌",
    body:  "Your Mumbai → Pune bus departs in 45 minutes. Please proceed to Platform 3." },
  { type: "scheduleChange",  title: "Schedule Update ⚠️",
    body:  "Your Delhi to Jaipur bus is delayed by 18 minutes due to traffic." },
  { type: "cancellation",    title: "Booking Cancelled",
    body:  "Your booking #BK00089 (Pune → Goa) has been cancelled. Refund of ₹850 will be processed in 3-5 days." },
  { type: "promotional",     title: "🎉 30% Off This Weekend!",
    body:  "Book any night bus this weekend and get 30% discount. Use code NIGHT30 at checkout." },
  { type: "offers",          title: "Flash Sale: Ends in 2 Hours ⚡",
    body:  "Mumbai ↔ Pune express routes at just ₹199. Limited seats available — book now!" },
  { type: "booking",         title: "New Booking Confirmed ✓",
    body:  "Bangalore to Chennai seat confirmed. Booking ID: #BK00102. Departure: 11:00 PM tonight." },
  { type: "journeyReminder", title: "Board in 15 Minutes 🚌",
    body:  "Your Bangalore → Chennai bus leaves in 15 minutes. Driver: Suresh K. Bus: KA-01-F-2345." },
  { type: "scheduleChange",  title: "Route Change Notice",
    body:  "Your Ahmedabad to Mumbai bus will now depart from Gate 7 instead of Gate 2. Sorry for inconvenience." },
  { type: "offers",          title: "You Earned a Reward! 🌟",
    body:  "Congratulations! You've completed 5 journeys on RouteNest. You've earned 500 reward points." },
];

function seedDemoNotifications(userId) {
  const store = getStore();
  const exists = store.notificationHistory.some((n) => n.userId === userId);
  if (exists) return 0;
  const baseTs = Date.now();
  DEMO.forEach((d, i) => {
    store.notificationHistory.push({
      id: nextId(store.notificationHistory),
      userId,
      type: d.type, title: d.title, body: d.body,
      channels: ["push", "inApp"], language: "en",
      // Stagger sentAt so demo #1 is newest in the list
      sentAt: new Date(baseTs - i * 1000).toISOString(),
      read: false, readAt: null, metadata: {},
    });
  });
  return DEMO.length;
}

module.exports = seedDemoNotifications;
