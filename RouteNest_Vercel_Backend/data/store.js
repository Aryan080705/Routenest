/**
 * In-memory data store for RouteNest.
 * Keeps posts, notifications, reviews, user profiles, forums, and moderation data
 * as live arrays so any route module can read/write them without a database.
 */

const initialData = () => ({
  // User profiles with verification and activity
  userProfiles: [
    {
      id: 1,
      userId: 1,
      name: "Aarav Mehta",
      email: "aarav@example.com",
      verified: true,
      verificationDate: new Date("2026-01-15").toISOString(),
      bio: "Passionate bus traveler and route explorer",
      avatar: "https://i.pravatar.cc/150?img=1",
      totalPosts: 12,
      totalLikes: 425,
      followersCount: 156,
      joinedAt: new Date("2025-01-01").toISOString(),
      badges: ["verified", "community_contributor", "helpful_reviewer"],
      socialLinks: {
        twitter: "aaravmehta",
        instagram: "aarav_travels"
      }
    },
    {
      id: 2,
      userId: 2,
      name: "Maya Shah",
      email: "maya@example.com",
      verified: true,
      verificationDate: new Date("2026-02-10").toISOString(),
      bio: "Solo traveler, route discoverer, safety advocate",
      avatar: "https://i.pravatar.cc/150?img=2",
      totalPosts: 8,
      totalLikes: 312,
      followersCount: 89,
      joinedAt: new Date("2025-03-20").toISOString(),
      badges: ["verified", "safety_advocate"],
      socialLinks: {
        instagram: "maya_travels"
      }
    },
    {
      id: 3,
      userId: 3,
      name: "Riya Kapoor",
      email: "riya@example.com",
      verified: true,
      verificationDate: new Date("2026-01-05").toISOString(),
      bio: "Destination guide and photo enthusiast",
      avatar: "https://i.pravatar.cc/150?img=3",
      totalPosts: 15,
      totalLikes: 567,
      followersCount: 234,
      joinedAt: new Date("2024-12-01").toISOString(),
      badges: ["verified", "community_contributor", "photo_expert"],
      socialLinks: {
        twitter: "riya_kapoor",
        instagram: "riya_destinations"
      }
    }
  ],

  // Enhanced posts with detailed comments
  posts: [
    {
      id: 1,
      authorId: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Routes",
      title: "Night bus from Pune to Goa",
      body: "Book the left-side sleeper seats if you want sunrise views near the ghats.",
      photo:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
      likes: [2, 3, 5, 8, 10],
      comments: [
        {
          id: 1,
          authorId: 2,
          author: "Maya Shah",
          verified: true,
          text: "Carry a light jacket.",
          likes: 8,
          timestamp: new Date("2026-04-17T10:30:00").toISOString()
        },
        {
          id: 2,
          authorId: 3,
          author: "Riya Kapoor",
          verified: true,
          text: "The food stop near Kolhapur is reliable.",
          likes: 12,
          timestamp: new Date("2026-04-17T11:00:00").toISOString()
        }
      ],
      reports: [],
      shares: {
        twitter: 5,
        facebook: 3,
        instagram: 8,
        whatsapp: 12
      },
      removed: false,
      createdAt: new Date("2026-04-17T09:00:00").toISOString()
    },
    {
      id: 2,
      authorId: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Travel Advice",
      title: "What helped on my first solo bus trip",
      body: "Save your ticket offline, share live location with family, and keep small cash ready.",
      photo:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      likes: [1, 3, 7],
      comments: [
        {
          id: 1,
          authorId: 1,
          author: "Aarav Mehta",
          verified: true,
          text: "Great checklist.",
          likes: 5,
          timestamp: new Date("2026-04-18T15:00:00").toISOString()
        },
        {
          id: 2,
          authorId: 4,
          author: "Vikram Singh",
          verified: false,
          text: "Offline ticket saved me once.",
          likes: 3,
          timestamp: new Date("2026-04-18T15:30:00").toISOString()
        }
      ],
      reports: [],
      shares: {
        twitter: 2,
        facebook: 4,
        instagram: 6,
        whatsapp: 15
      },
      removed: false,
      createdAt: new Date("2026-04-18T14:30:00").toISOString()
    },
    {
      id: 3,
      authorId: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "Hidden gem stops between Delhi and Jaipur",
      body: "Ask the driver to drop you at Neemrana — the stepwell is worth the detour.",
      photo:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
      likes: [1, 2, 5, 9],
      comments: [
        {
          id: 1,
          authorId: 2,
          author: "Maya Shah",
          verified: true,
          text: "Added to my bucket list!",
          likes: 7,
          timestamp: new Date("2026-04-19T12:00:00").toISOString()
        },
        {
          id: 2,
          authorId: 1,
          author: "Aarav Mehta",
          verified: true,
          text: "How long is the detour?",
          likes: 4,
          timestamp: new Date("2026-04-19T12:30:00").toISOString()
        }
      ],
      reports: [],
      shares: {
        twitter: 8,
        facebook: 6,
        instagram: 14,
        whatsapp: 20
      },
      removed: false,
      createdAt: new Date("2026-04-19T11:15:00").toISOString()
    }
  ],

  // Forum categories and topics
  forums: [
    {
      id: 1,
      title: "Routes Discussion",
      slug: "routes",
      description: "Share and discuss bus routes across India",
      icon: "🛣️",
      topics: [
        {
          id: 1,
          title: "North India Routes",
          slug: "north-india",
          description: "Delhi, Punjab, Himachal Pradesh routes",
          postsCount: 24,
          lastActivityAt: new Date("2026-04-20T10:00:00").toISOString()
        },
        {
          id: 2,
          title: "South India Routes",
          slug: "south-india",
          description: "Karnataka, Tamil Nadu, Andhra Pradesh routes",
          postsCount: 18,
          lastActivityAt: new Date("2026-04-19T15:00:00").toISOString()
        },
        {
          id: 3,
          title: "Western Routes",
          slug: "western",
          description: "Maharashtra, Gujarat, Goa routes",
          postsCount: 31,
          lastActivityAt: new Date("2026-04-20T09:00:00").toISOString()
        }
      ]
    },
    {
      id: 2,
      title: "Travel Tips & Advice",
      slug: "travel-tips",
      description: "Get advice from experienced travelers",
      icon: "✈️",
      topics: [
        {
          id: 1,
          title: "Safety & Security",
          slug: "safety",
          description: "Solo travel safety, women travelers, safety tips",
          postsCount: 42,
          lastActivityAt: new Date("2026-04-20T11:00:00").toISOString()
        },
        {
          id: 2,
          title: "Budget Travel",
          slug: "budget",
          description: "Budget tips, deals, travel hacks",
          postsCount: 35,
          lastActivityAt: new Date("2026-04-20T08:00:00").toISOString()
        }
      ]
    },
    {
      id: 3,
      title: "Destination Guides",
      slug: "destinations",
      description: "Explore hidden gems and popular destinations",
      icon: "🗺️",
      topics: [
        {
          id: 1,
          title: "Beach Destinations",
          slug: "beaches",
          description: "Goa, Kerala, Karnataka beaches",
          postsCount: 27,
          lastActivityAt: new Date("2026-04-20T07:00:00").toISOString()
        },
        {
          id: 2,
          title: "Hill Stations",
          slug: "hills",
          description: "Himalayas, Western Ghats, Nilgiris",
          postsCount: 19,
          lastActivityAt: new Date("2026-04-19T18:00:00").toISOString()
        }
      ]
    },
    {
      id: 4,
      title: "Bus Reviews",
      slug: "bus-reviews",
      description: "Rate and review bus operators, services, and amenities",
      icon: "⭐",
      topics: [
        {
          id: 1,
          title: "Operator Reviews",
          slug: "operator-reviews",
          description: "Review bus operators like GSRTC, MSRTC, RedBus, VRL etc.",
          postsCount: 38,
          lastActivityAt: new Date("2026-04-20T12:00:00").toISOString()
        },
        {
          id: 2,
          title: "Bus Amenities",
          slug: "amenities",
          description: "WiFi, charging ports, sleeper quality, AC reviews",
          postsCount: 22,
          lastActivityAt: new Date("2026-04-20T06:00:00").toISOString()
        },
        {
          id: 3,
          title: "Complaint Corner",
          slug: "complaints",
          description: "Report bad experiences and warn fellow travelers",
          postsCount: 15,
          lastActivityAt: new Date("2026-04-19T20:00:00").toISOString()
        }
      ]
    }
  ],

  // Moderation queue and reports
  moderationQueue: [
    {
      id: 1,
      postId: 5,
      reportedBy: 4,
      reason: "inappropriate_content",
      description: "Contains offensive language",
      reportedAt: new Date("2026-04-20T10:15:00").toISOString(),
      status: "pending",
      reviewedBy: null,
      action: null
    }
  ],

  // Social media shares tracking
  socialShares: [
    {
      id: 1,
      postId: 1,
      userId: 1,
      platform: "twitter",
      sharedAt: new Date("2026-04-17T10:00:00").toISOString(),
      url: "https://twitter.com/user/status/12345"
    },
    {
      id: 2,
      postId: 2,
      userId: 2,
      platform: "instagram",
      sharedAt: new Date("2026-04-18T15:30:00").toISOString(),
      url: "https://instagram.com/p/12345"
    }
  ],

  // Comprehensive notification system
  userNotificationPreferences: [
    {
      id: 1,
      userId: 1,
      email: "aarav@example.com",
      language: "en",
      channels: {
        email: true,
        push: true,
        sms: false
      },
      notificationTypes: {
        booking: true,
        cancellation: true,
        scheduleChange: true,
        journeyReminder: true,
        promotional: false,
        offers: false
      },
      timezone: "Asia/Kolkata",
      quiet_hours_enabled: true,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
      createdAt: new Date("2026-01-15").toISOString(),
      updatedAt: new Date("2026-04-20").toISOString()
    },
    {
      id: 2,
      userId: 2,
      email: "maya@example.com",
      language: "en",
      channels: {
        email: true,
        push: true,
        sms: true
      },
      notificationTypes: {
        booking: true,
        cancellation: true,
        scheduleChange: true,
        journeyReminder: true,
        promotional: true,
        offers: true
      },
      timezone: "Asia/Kolkata",
      quiet_hours_enabled: false,
      quiet_hours_start: "23:00",
      quiet_hours_end: "07:00",
      createdAt: new Date("2026-02-10").toISOString(),
      updatedAt: new Date("2026-04-20").toISOString()
    },
    {
      id: 3,
      userId: 3,
      email: "riya@example.com",
      language: "hi",
      channels: {
        email: true,
        push: false,
        sms: true
      },
      notificationTypes: {
        booking: true,
        cancellation: true,
        scheduleChange: true,
        journeyReminder: false,
        promotional: false,
        offers: true
      },
      timezone: "Asia/Kolkata",
      quiet_hours_enabled: true,
      quiet_hours_start: "21:00",
      quiet_hours_end: "09:00",
      createdAt: new Date("2026-01-05").toISOString(),
      updatedAt: new Date("2026-04-20").toISOString()
    }
  ],

  // Notification history - all sent notifications
  notificationHistory: [
    {
      id: 1,
      userId: 1,
      type: "booking",
      title: "Booking Confirmed ✓",
      body: "Your bus booking from Mumbai to Pune is confirmed. Booking ID: #BK12345",
      channels: ["email", "push"],
      language: "en",
      sentAt: new Date("2026-04-17T10:00:00").toISOString(),
      read: true,
      readAt: new Date("2026-04-17T10:05:00").toISOString(),
      metadata: {
        bookingId: "BK12345",
        from: "Mumbai",
        to: "Pune",
        date: "2026-05-01"
      }
    },
    {
      id: 2,
      userId: 1,
      type: "scheduleChange",
      title: "Schedule Update",
      body: "Your bus departure for Mumbai to Pune has been delayed by 18 minutes.",
      channels: ["push"],
      language: "en",
      sentAt: new Date("2026-04-17T10:12:00").toISOString(),
      read: true,
      readAt: new Date("2026-04-17T10:15:00").toISOString(),
      metadata: {
        bookingId: "BK12345",
        delayMinutes: 18
      }
    },
    {
      id: 3,
      userId: 1,
      type: "journeyReminder",
      title: "Journey Reminder",
      body: "Your bus boarding starts in 45 minutes. Please head to the designated boarding area.",
      channels: ["push"],
      language: "en",
      sentAt: new Date("2026-04-17T10:20:00").toISOString(),
      read: false,
      readAt: null,
      metadata: {
        bookingId: "BK12345",
        timeUntilBoarding: "45 minutes"
      }
    },
    {
      id: 4,
      userId: 2,
      type: "promotional",
      title: "Special Offer: 30% Off",
      body: "Celebrate summer with 30% discount on all night buses. Valid till June 30!",
      channels: ["email"],
      language: "en",
      sentAt: new Date("2026-04-18T09:00:00").toISOString(),
      read: false,
      readAt: null,
      metadata: {
        campaignId: "SUMMER30",
        discount: 30
      }
    },
    {
      id: 5,
      userId: 3,
      type: "cancellation",
      title: "बुकिंग रद्द हुई",
      body: "आपकी दिल्ली से जयपुर की बस यात्रा रद्द हो गई है। आपका पूरा रिफंड जल्द आ जाएगा।",
      channels: ["sms", "email"],
      language: "hi",
      sentAt: new Date("2026-04-19T14:00:00").toISOString(),
      read: true,
      readAt: new Date("2026-04-19T14:10:00").toISOString(),
      metadata: {
        bookingId: "BK12340",
        reason: "operational_issue",
        refundAmount: 2500
      }
    }
  ],

  // Notification delivery queue - pending/retrying notifications
  notificationQueue: [
    {
      id: 1,
      userId: 1,
      type: "offers",
      title: "Flash Sale: 40% Off Tonight",
      body: "Limited time offer on express routes. Book now!",
      channels: ["email", "push"],
      language: "en",
      status: "pending",
      scheduledFor: new Date("2026-04-20T16:00:00").toISOString(),
      createdAt: new Date("2026-04-20T10:00:00").toISOString(),
      retries: 0,
      maxRetries: 3,
      lastRetryAt: null
    },
    {
      id: 2,
      userId: 2,
      type: "booking",
      title: "Booking Confirmed",
      body: "Your new booking is confirmed. Details sent.",
      channels: ["push"],
      language: "en",
      status: "pending",
      scheduledFor: new Date("2026-04-20T15:30:00").toISOString(),
      createdAt: new Date("2026-04-20T10:15:00").toISOString(),
      retries: 0,
      maxRetries: 3,
      lastRetryAt: null
    }
  ],

  // Delivery logs for reliability tracking
  deliveryLogs: [
    {
      id: 1,
      notificationId: 1,
      userId: 1,
      channel: "email",
      status: "delivered",
      sentAt: new Date("2026-04-17T10:00:00").toISOString(),
      deliveredAt: new Date("2026-04-17T10:00:30").toISOString(),
      failureReason: null,
      retryCount: 0
    },
    {
      id: 2,
      notificationId: 2,
      userId: 1,
      channel: "push",
      status: "delivered",
      sentAt: new Date("2026-04-17T10:12:00").toISOString(),
      deliveredAt: new Date("2026-04-17T10:12:15").toISOString(),
      failureReason: null,
      retryCount: 0
    },
    {
      id: 3,
      notificationId: 1,
      userId: 1,
      channel: "push",
      status: "failed",
      sentAt: new Date("2026-04-17T10:00:00").toISOString(),
      deliveredAt: null,
      failureReason: "device_offline",
      retryCount: 2
    }
  ],

  // Legacy notifications array for backward compatibility
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
      status: "delivered",
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
  ],

  userPreferences: {},
  users: [],
  sessions: {}
});

/* ── live store ─────────────────────────────────────────────── */

let store = initialData();

const addMockData = () => {
  // Mock data disabled to prevent showing dummy posts and reviews
};
// addMockData();

const getStore = () => store;

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

module.exports = { getStore, resetStore, nextId };
