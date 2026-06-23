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

  posts: [
    {
      id: 1,
      authorId: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Routes",
      title: "Night bus from Pune to Goa — everything you need to know",
      body: "Book the left-side sleeper seats if you want sunrise views near the ghats. Carry a light blanket since the AC can get cold after midnight. The food stop near Kolhapur is the best — try the misal pav there. Overall a very scenic and comfortable overnight journey.",
      photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
      likes: [2, 3, 5, 8, 10, 12, 15],
      likedAt: {},
      comments: [
        { id: 1, authorId: 2, author: "Maya Shah", verified: true, text: "Carry a light jacket — the AC is freezing after 2 AM!", likes: 8, timestamp: new Date("2026-04-17T10:30:00").toISOString() },
        { id: 2, authorId: 3, author: "Riya Kapoor", verified: true, text: "The food stop near Kolhapur is so reliable. Their misal pav is fire.", likes: 12, timestamp: new Date("2026-04-17T11:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 5, facebook: 3, instagram: 8, whatsapp: 12 },
      removed: false, createdAt: new Date("2026-04-17T09:00:00").toISOString()
    },
    {
      id: 2,
      authorId: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Travel Advice",
      title: "What actually helped on my first solo bus trip",
      body: "Save your ticket offline, share live location with family, and always keep small cash ready. Most toll booth areas have no phone signal. Carry snacks because unscheduled delays are real. Also, window seat on the left gives best views going north.",
      photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      likes: [1, 3, 7, 9, 11],
      likedAt: {},
      comments: [
        { id: 1, authorId: 1, author: "Aarav Mehta", verified: true, text: "Great checklist! Offline ticket tip is gold.", likes: 5, timestamp: new Date("2026-04-18T15:00:00").toISOString() },
        { id: 2, authorId: 4, author: "Vikram Singh", verified: false, text: "Offline ticket saved me once during a strike. Great advice.", likes: 3, timestamp: new Date("2026-04-18T15:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 2, facebook: 4, instagram: 6, whatsapp: 15 },
      removed: false, createdAt: new Date("2026-04-18T14:30:00").toISOString()
    },
    {
      id: 3,
      authorId: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "Hidden gem stops between Delhi and Jaipur",
      body: "Ask the driver to drop you at Neemrana — the stepwell is worth the detour. Baoli is less crowded than Abhaneri and just as beautiful. The entire stretch has great dhaba food too. Don't skip the dal baati on the way!",
      photo: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
      likes: [1, 2, 5, 9, 13],
      likedAt: {},
      comments: [
        { id: 1, authorId: 2, author: "Maya Shah", verified: true, text: "Added Neemrana to my bucket list!", likes: 7, timestamp: new Date("2026-04-19T12:00:00").toISOString() },
        { id: 2, authorId: 1, author: "Aarav Mehta", verified: true, text: "How long is the detour from the main highway?", likes: 4, timestamp: new Date("2026-04-19T12:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 8, facebook: 6, instagram: 14, whatsapp: 20 },
      removed: false, createdAt: new Date("2026-04-19T11:15:00").toISOString()
    },
    {
      id: 4,
      authorId: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Routes",
      title: "Mumbai to Ahmedabad: Gujarat Queen vs GSRTC — which one?",
      body: "Took both in the same week. Gujarat Queen has better seats and AC but costs 40% more. GSRTC is punctual and the new Volvo coaches are surprisingly comfortable. For budget trips GSRTC wins, but for comfort on an overnight haul, pay extra for Gujarat Queen.",
      photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
      likes: [2, 3, 6, 8, 11, 14],
      likedAt: {},
      comments: [
        { id: 1, authorId: 3, author: "Riya Kapoor", verified: true, text: "GSRTC Volvo is underrated honestly!", likes: 9, timestamp: new Date("2026-04-20T08:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 6, facebook: 4, instagram: 10, whatsapp: 18 },
      removed: false, createdAt: new Date("2026-04-20T07:00:00").toISOString()
    },
    {
      id: 5,
      authorId: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Safety",
      title: "Safety tips for women traveling alone on long-distance buses",
      body: "Always choose a seat near the front (1-3 rows). Keep your phone charged and downloaded offline. Share a live pin before boarding. I use a small personal alarm clipped to my bag. Also, window seat means you control the light — useful for long night journeys.",
      photo: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=900&q=80",
      likes: [1, 3, 5, 7, 9, 12, 15, 16],
      likedAt: {},
      comments: [
        { id: 1, authorId: 1, author: "Aarav Mehta", verified: true, text: "Sharing this with my sister who travels often. Thank you!", likes: 14, timestamp: new Date("2026-04-21T09:30:00").toISOString() },
        { id: 2, authorId: 3, author: "Riya Kapoor", verified: true, text: "The personal alarm tip is underrated. I carry one too.", likes: 11, timestamp: new Date("2026-04-21T10:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 15, facebook: 12, instagram: 20, whatsapp: 34 },
      removed: false, createdAt: new Date("2026-04-21T08:45:00").toISOString()
    },
    {
      id: 6,
      authorId: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "Bangalore to Ooty by bus — the most scenic ride in India?",
      body: "I genuinely think the Bangalore to Ooty route through Gudalur is the most breathtaking bus journey in India. The hairpin bends are wild, the mist is magical at 6 AM, and the tea estates look painted. Take KSRTC for value. Book the morning departure — views disappear by afternoon.",
      photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
      likes: [1, 2, 4, 6, 8, 10, 13, 17],
      likedAt: {},
      comments: [
        { id: 1, authorId: 2, author: "Maya Shah", verified: true, text: "Did this last monsoon — honestly life-changing. 10/10!", likes: 18, timestamp: new Date("2026-04-22T06:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 20, facebook: 14, instagram: 30, whatsapp: 25 },
      removed: false, createdAt: new Date("2026-04-22T06:00:00").toISOString()
    },
    {
      id: 7,
      authorId: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Travel Advice",
      title: "How to survive a 20-hour bus journey like a pro",
      body: "Noise-cancelling earbuds are non-negotiable. Bring a neck pillow, compression socks (seriously), and a day's worth of dry snacks. Set alarms for every 3 hours to stretch in the aisle. Most long-haul buses have 1-2 stops where you can get off and breathe — always use them.",
      photo: "https://images.unsplash.com/photo-1532635241-17e820acc59f?auto=format&fit=crop&w=900&q=80",
      likes: [2, 3, 5, 7, 11],
      likedAt: {},
      comments: [
        { id: 1, authorId: 3, author: "Riya Kapoor", verified: true, text: "Compression socks! Never thought about that — genius.", likes: 6, timestamp: new Date("2026-04-23T10:00:00").toISOString() },
        { id: 2, authorId: 2, author: "Maya Shah", verified: true, text: "I'd add: bring a portable charger. Always.", likes: 9, timestamp: new Date("2026-04-23T10:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 4, facebook: 3, instagram: 9, whatsapp: 22 },
      removed: false, createdAt: new Date("2026-04-23T09:30:00").toISOString()
    },
    {
      id: 8,
      authorId: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Routes",
      title: "Chennai to Pondicherry — shortest, cheapest, most beautiful?",
      body: "East Coast Road is a gem. Take the ECR bus from Thiruvanmiyur and get window seat on the right side going south — you ride literally next to the Bay of Bengal for almost an hour. The whole journey is 2.5 hrs and costs under ₹80. Do it on a weekday to avoid crowds.",
      photo: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
      likes: [1, 3, 6, 9, 12],
      likedAt: {},
      comments: [
        { id: 1, authorId: 1, author: "Aarav Mehta", verified: true, text: "The ECR is genuinely one of the prettiest coastal roads in India.", likes: 10, timestamp: new Date("2026-04-24T11:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 7, facebook: 5, instagram: 11, whatsapp: 19 },
      removed: false, createdAt: new Date("2026-04-24T10:00:00").toISOString()
    },
    {
      id: 9,
      authorId: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "The best dhabas on the Delhi-Chandigarh highway — a ranked list",
      body: "After 12 trips I have tried them all. #1: Haveli near Karnal — massive portions, clean washrooms, great lassi. #2: Pal Dhaba near Murthal — the butter chicken is unreal. #3: Sukhdev near Murthal — classic and never disappoints. Skip the ones right off the main toll — overpriced.",
      photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
      likes: [1, 2, 4, 5, 7, 10, 14],
      likedAt: {},
      comments: [
        { id: 1, authorId: 2, author: "Maya Shah", verified: true, text: "Sukhdev never disappoints. Been going there since 2019.", likes: 8, timestamp: new Date("2026-04-25T08:00:00").toISOString() },
        { id: 2, authorId: 1, author: "Aarav Mehta", verified: true, text: "Haveli near Karnal is unbeatable for the money.", likes: 7, timestamp: new Date("2026-04-25T08:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 12, facebook: 8, instagram: 16, whatsapp: 28 },
      removed: false, createdAt: new Date("2026-04-25T07:30:00").toISOString()
    },
    {
      id: 10,
      authorId: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Travel Advice",
      title: "Why I stopped booking premium buses and switched back to state transport",
      body: "Paid ₹1,200 for a so-called luxury sleeper — broken footrest, flickering AC, and a 45-minute delay with no update. Then took MSRTC Shivneri for ₹380 — on time, clean, and the driver was courteous. State transport has seriously upped its game. Don't always fall for the marketing.",
      photo: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
      likes: [2, 3, 5, 8],
      likedAt: {},
      comments: [
        { id: 1, authorId: 3, author: "Riya Kapoor", verified: true, text: "MSRTC Shivneri is seriously underrated. Best bus in Maharashtra.", likes: 11, timestamp: new Date("2026-04-26T14:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 9, facebook: 5, instagram: 12, whatsapp: 17 },
      removed: false, createdAt: new Date("2026-04-26T13:00:00").toISOString()
    },
    {
      id: 11,
      authorId: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Safety",
      title: "What to do if your bus breaks down in the middle of nowhere",
      body: "Happened to me twice. Always have: (1) the operator's helpline saved, (2) GPS coordinates handy (Google Maps > share location), (3) enough offline data to look up alternatives. Don't get off unless the driver says so — it is usually safer on the bus. Most operators will send a replacement within 2 hours.",
      photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
      likes: [1, 3, 6, 9, 11, 14],
      likedAt: {},
      comments: [
        { id: 1, authorId: 1, author: "Aarav Mehta", verified: true, text: "The GPS coordinates tip is so practical. Saving this post.", likes: 12, timestamp: new Date("2026-04-27T09:00:00").toISOString() }
      ],
      reports: [], shares: { twitter: 8, facebook: 7, instagram: 13, whatsapp: 26 },
      removed: false, createdAt: new Date("2026-04-27T08:30:00").toISOString()
    },
    {
      id: 12,
      authorId: 3,
      author: "Riya Kapoor",
      verified: true,
      topic: "Destinations",
      title: "Manali in 3 days — the bus-traveler's complete guide",
      body: "Delhi to Manali overnight HRTC (the deluxe AC one) is excellent. Arrive early morning, straight to Old Manali for breakfast. Day 2 do Solang Valley (shared cab ₹200). Day 3 Hadimba Temple + Mall Road. Return bus leaves 5 PM from ISBT Manali. Book both legs 2 days ahead or seats vanish.",
      photo: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
      likes: [1, 2, 4, 5, 7, 9, 10, 13, 15],
      likedAt: {},
      comments: [
        { id: 1, authorId: 2, author: "Maya Shah", verified: true, text: "HRTC deluxe is so comfortable. Did this trip last summer!", likes: 14, timestamp: new Date("2026-04-28T10:00:00").toISOString() },
        { id: 2, authorId: 1, author: "Aarav Mehta", verified: true, text: "Planning this for July. Thanks for the complete guide!", likes: 10, timestamp: new Date("2026-04-28T10:30:00").toISOString() }
      ],
      reports: [], shares: { twitter: 18, facebook: 12, instagram: 25, whatsapp: 40 },
      removed: false, createdAt: new Date("2026-04-28T09:30:00").toISOString()
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
      userId: 1,
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "Clean bus, smooth boarding, and the driver kept stops organized. Shivneri is hands down the best state-run bus in India. On time both ways. Would recommend to anyone doing this route.",
      helpful: 18,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-17T12:00:00").toISOString()
    },
    {
      id: 2,
      route: "Delhi to Jaipur",
      user: "Maya Shah",
      userId: 2,
      verified: true,
      completedJourney: true,
      rating: 4,
      text: "Good timing and clear announcements, though the last rest stop was crowded. The AC was perfect and seats were comfortable. Driver was professional and kept the schedule. Minor complaint: the onboard music was too loud for the first hour.",
      helpful: 13,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-18T15:00:00").toISOString()
    },
    {
      id: 3,
      route: "Bangalore to Goa",
      user: "Riya Kapoor",
      userId: 3,
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "Absolutely stunning journey through the Western Ghats. The overnight sleeper was comfortable and the bus arrived 15 minutes early! The food stop at Dharwad was excellent. Would do this again without hesitation.",
      helpful: 22,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-19T10:00:00").toISOString()
    },
    {
      id: 4,
      route: "Chennai to Pondicherry",
      user: "Aarav Mehta",
      userId: 1,
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "ECR route is absolutely beautiful — you can see the ocean almost the entire way. Bus was on time, affordable, and the conductor was helpful. Best value bus journey I have ever taken in India. Do it on a weekday for less crowd.",
      helpful: 15,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-20T11:00:00").toISOString()
    },
    {
      id: 5,
      route: "Pune to Bangalore",
      user: "Maya Shah",
      userId: 2,
      verified: true,
      completedJourney: true,
      rating: 3,
      text: "The bus was nearly 90 minutes late with zero communication from the operator. Seats were decent once we boarded. The AC worked well. Night journey was fairly smooth. Would have rated 4 or 5 if they had just sent a delay notification.",
      helpful: 9,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-21T08:00:00").toISOString()
    },
    {
      id: 6,
      route: "Delhi to Manali",
      user: "Riya Kapoor",
      userId: 3,
      verified: true,
      completedJourney: true,
      rating: 4,
      text: "HRTC Deluxe overnight is the best way to get to Manali. Bus is clean, crew is helpful, and the mountain roads section is handled very carefully. Slight bump in rating: the footrest was broken on seat 14. Book early, these fill up fast!",
      helpful: 28,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-22T07:00:00").toISOString()
    },
    {
      id: 7,
      route: "Mumbai to Ahmedabad",
      user: "Aarav Mehta",
      userId: 1,
      verified: true,
      completedJourney: true,
      rating: 4,
      text: "Gujarat Queen lived up to its reputation. Comfortable recliner seats, working AC, and they served snacks onboard which was a nice surprise. Highway is smooth. Only issue: the 3 AM food stop was too short — barely 10 minutes.",
      helpful: 11,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-23T13:00:00").toISOString()
    },
    {
      id: 8,
      route: "Hyderabad to Bangalore",
      user: "Maya Shah",
      userId: 2,
      verified: true,
      completedJourney: true,
      rating: 2,
      text: "Very disappointing experience. Bus was an hour late, AC stopped working for 2 hours, and the driver drove recklessly on the highway. The seats were worn out and uncomfortable. The operator did not respond to complaints. Will not use this operator again.",
      helpful: 31,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-24T16:00:00").toISOString()
    },
    {
      id: 9,
      route: "Jaipur to Udaipur",
      user: "Riya Kapoor",
      userId: 3,
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "One of the most scenic bus routes in Rajasthan. The Aravalli hills are gorgeous at sunset. RSRTC Volvo was comfortable, punctual, and reasonably priced. Highly recommend the window seat on the right side going toward Udaipur. A must-do journey.",
      helpful: 19,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-25T09:30:00").toISOString()
    },
    {
      id: 10,
      route: "Kolkata to Bhubaneswar",
      user: "Aarav Mehta",
      userId: 1,
      verified: true,
      completedJourney: true,
      rating: 3,
      text: "Average experience. Bus was on time but the interior was not well maintained. The seats were uncomfortable for a 6-hour journey. No Wi-Fi as advertised. Food stop was decent. The driver was safe and drove well. Would consider alternatives next time.",
      helpful: 7,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-26T10:00:00").toISOString()
    },
    {
      id: 11,
      route: "Kochi to Bangalore",
      user: "Maya Shah",
      userId: 2,
      verified: true,
      completedJourney: true,
      rating: 5,
      text: "Incredible overnight journey through Kerala and Karnataka. The KSRTC Garuda Plus was spotless, cold AC, and the crew was very professional. Arrived 20 minutes ahead of schedule. The Palakkad pass section at dawn is absolutely breathtaking. Best bus journey this year.",
      helpful: 24,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-27T07:00:00").toISOString()
    },
    {
      id: 12,
      route: "Pune to Goa",
      user: "Riya Kapoor",
      userId: 3,
      verified: true,
      completedJourney: true,
      rating: 4,
      text: "Great overnight sleeper experience. Booked the lower berth and it was very comfortable. The ghat section is managed carefully — no reckless driving. Arrived in Panaji right on time at 6 AM. Only downside: the blanket provided was thin. Carry your own for comfort.",
      helpful: 16,
      helpfulBy: [],
      reports: 0,
      hidden: false,
      createdAt: new Date("2026-04-28T06:30:00").toISOString()
    }
  ],

  userPreferences: {},
  users: [],
  sessions: {},
  savedRoutes: {}
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
