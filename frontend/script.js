const STORAGE_KEY = "routenest-state";
const ALLOWED_THEMES = ["light", "dark"];

const translations = {
  en: {
    navExplore: "Explore",
    navCommunity: "Community",
    navPlanner: "Planner",
    navNotifications: "Notifications",
    navReviews: "Reviews",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    eyebrow: "Verified bus travel community",
    heroTitle: "Plan smarter bus journeys with travelers who have been there.",
    heroBody: "Create posts, compare routes, manage notifications, switch languages, save preferences, and review completed trips in one responsive platform.",
    stories: "stories",
    savedRoutes: "saved routes",
    avgRating: "average rating",
    communityEyebrow: "Community",
    communityTitle: "Stories, tips, photos, and forums",
    communityBody: "Only verified users can post. Everyone can learn from routes, destinations, and travel advice.",
    createPost: "Create a post",
    verifiedUser: "Verified user",
    yes: "Yes",
    no: "No",
    forumTopic: "Forum topic",
    postTitle: "Post title",
    postBody: "Story or tip",
    photoUrl: "Photo URL",
    publish: "Publish",
    all: "All",
    plannerEyebrow: "Route planner",
    plannerTitle: "Compare routes with live traffic style updates",
    plannerBody: "Add waypoints, compare distance and time, save frequent routes, and refresh conditions while planning.",
    startLocation: "Start location",
    destination: "Destination",
    waypoints: "Waypoints",
    suggestRoutes: "Suggest routes",
    refreshTraffic: "Refresh traffic",
    notificationsEyebrow: "Notifications",
    notificationsTitle: "Reliable email and push updates",
    notificationsBody: "Manage preferences, promotional opt-in, localization, delivery status, retries, and history.",
    preferences: "Preferences",
    emailNotifications: "Email notifications",
    pushNotifications: "Push notifications",
    promoNotifications: "Promotional offers",
    savePreferences: "Save preferences",
    reviewsEyebrow: "Route reviews",
    reviewsTitle: "Feedback from completed journeys",
    reviewsBody: "Verified travelers can review a route once per completed journey. Reported reviews are removed from rating calculations.",
    writeReview: "Write a review",
    completedJourney: "Completed journey",
    routeName: "Route",
    rating: "Rating",
    reviewText: "Review",
    submitReview: "Submit review",
    profileEyebrow: "Profile activity",
    profileTitle: "Traveler contributions",
    footerText: "Built for responsive internship project evaluation.",
    verifiedOnly: "Only verified users can post content.",
    postCreated: "Post published and added to your profile activity.",
    prefsSaved: "Notification preferences saved.",
    reviewBlocked: "Reviews are allowed only after a completed journey.",
    reviewShort: "Review must be at least 30 characters.",
    reviewDuplicate: "You already reviewed this route for this journey.",
    reviewCreated: "Review submitted. You can edit the text within 24 hours.",
    popular: "Popular now",
    report: "Report",
    remove: "Remove",
    like: "Like",
    comment: "Comment",
    share: "Share",
    saveRoute: "Save route",
    saved: "Saved",
    retry: "Retry",
    delivered: "Delivered",
    retrying: "Retrying",
    failed: "Failed",
    trusted: "Trusted reviewer",
    trafficLow: "Low traffic",
    trafficMedium: "Moderate traffic",
    trafficHigh: "Heavy traffic",
    planTrip: "Plan a trip",
    joinCommunity: "Join community",
    navigationEyebrow: "Navigation",
    navigationTitle: "Choose where you want to go",
    navigationBody: "Quick access to all major RouteNest modules for bus journey planning, community engagement, updates, and reviews.",
    navCardCommunity: "Traveler Community",
    navCardCommunityBody: "Share stories, tips, photos, comments, likes, reports, and forum discussions.",
    navCardPlanner: "Route Planner",
    navCardPlannerBody: "Compare routes, add waypoints, save trips, and check traffic-style updates.",
    navCardNotifications: "Notifications",
    navCardNotificationsBody: "Manage email, push, promotions, retries, delivery status, and history.",
    navCardReviews: "Route Reviews",
    navCardReviewsBody: "Review completed journeys, report poor content, and find trusted reviewers.",
    navCardProfile: "Profile Activity",
    navCardProfileBody: "View posts, saved routes, reviews, likes, and recent contribution history.",
    navCardSettings: "Language and Theme",
    navCardSettingsBody: "Switch language, use dark mode, and keep preferences saved locally."
  },
  hi: {
    navCommunity: "समुदाय",
    navPlanner: "योजना",
    navNotifications: "सूचनाएं",
    navReviews: "समीक्षा",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    eyebrow: "सत्यापित बस यात्रा समुदाय",
    heroTitle: "उन यात्रियों के साथ बेहतर बस यात्रा प्लान करें जो पहले जा चुके हैं.",
    heroBody: "पोस्ट बनाएं, रूट तुलना करें, सूचनाएं संभालें, भाषा बदलें, पसंद सेव करें और पूरी हुई यात्राओं की समीक्षा करें.",
    stories: "कहानियां",
    savedRoutes: "सेव रूट",
    avgRating: "औसत रेटिंग",
    communityEyebrow: "समुदाय",
    communityTitle: "कहानियां, टिप्स, फोटो और फोरम",
    communityBody: "सिर्फ सत्यापित उपयोगकर्ता पोस्ट कर सकते हैं. सभी लोग रूट, जगह और सलाह से सीख सकते हैं.",
    createPost: "पोस्ट बनाएं",
    verifiedUser: "सत्यापित उपयोगकर्ता",
    yes: "हां",
    no: "नहीं",
    forumTopic: "फोरम विषय",
    postTitle: "पोस्ट शीर्षक",
    postBody: "कहानी या टिप",
    photoUrl: "फोटो URL",
    publish: "प्रकाशित करें",
    all: "सभी",
    plannerEyebrow: "रूट प्लानर",
    plannerTitle: "लाइव ट्रैफिक अपडेट के साथ रूट तुलना करें",
    plannerBody: "वेपॉइंट जोड़ें, दूरी और समय की तुलना करें, पसंदीदा रूट सेव करें और ट्रैफिक अपडेट करें.",
    startLocation: "शुरुआत",
    destination: "गंतव्य",
    waypoints: "वेपॉइंट",
    suggestRoutes: "रूट सुझाएं",
    refreshTraffic: "ट्रैफिक अपडेट",
    notificationsEyebrow: "सूचनाएं",
    notificationsTitle: "भरोसेमंद ईमेल और पुश अपडेट",
    notificationsBody: "पसंद, ऑफर, भाषा, डिलीवरी स्थिति, रिट्राई और इतिहास संभालें.",
    preferences: "पसंद",
    emailNotifications: "ईमेल सूचनाएं",
    pushNotifications: "पुश सूचनाएं",
    promoNotifications: "प्रमोशनल ऑफर",
    savePreferences: "पसंद सेव करें",
    reviewsEyebrow: "रूट समीक्षा",
    reviewsTitle: "पूरी हुई यात्राओं से मिली प्रतिक्रिया",
    reviewsBody: "सत्यापित यात्री पूरी हुई यात्रा के बाद एक बार समीक्षा कर सकते हैं.",
    writeReview: "समीक्षा लिखें",
    completedJourney: "यात्रा पूरी हुई",
    routeName: "रूट",
    rating: "रेटिंग",
    reviewText: "समीक्षा",
    submitReview: "समीक्षा भेजें",
    profileEyebrow: "प्रोफाइल गतिविधि",
    profileTitle: "यात्री योगदान",
    footerText: "रेस्पॉन्सिव इंटर्नशिप प्रोजेक्ट मूल्यांकन के लिए बनाया गया.",
    verifiedOnly: "सिर्फ सत्यापित उपयोगकर्ता कंटेंट पोस्ट कर सकते हैं.",
    postCreated: "पोस्ट प्रकाशित हुई और प्रोफाइल गतिविधि में जुड़ गई.",
    prefsSaved: "सूचना पसंद सेव हो गई.",
    reviewBlocked: "समीक्षा केवल पूरी हुई यात्रा के बाद ही की जा सकती है.",
    reviewShort: "समीक्षा कम से कम 30 अक्षरों की होनी चाहिए.",
    reviewDuplicate: "आप इस यात्रा के लिए इस रूट की समीक्षा कर चुके हैं.",
    reviewCreated: "समीक्षा भेज दी गई. आप 24 घंटे के भीतर टेक्स्ट एडिट कर सकते हैं.",
    popular: "लोकप्रिय",
    report: "रिपोर्ट",
    remove: "हटाएं",
    like: "लाइक",
    comment: "टिप्पणी",
    share: "शेयर",
    saveRoute: "रूट सेव",
    saved: "सेव हुआ",
    retry: "फिर कोशिश",
    delivered: "डिलीवर",
    retrying: "रिट्राई",
    failed: "असफल",
    trusted: "विश्वसनीय समीक्षक",
    trafficLow: "कम ट्रैफिक",
    trafficMedium: "मध्यम ट्रैफिक",
    trafficHigh: "भारी ट्रैफिक"
  },
  es: {}
};

translations.es = { ...translations.en, navCommunity: "Comunidad", navPlanner: "Rutas", navNotifications: "Avisos", navReviews: "Reseñas", darkMode: "Modo oscuro", lightMode: "Modo claro", heroTitle: "Planifica mejores viajes en bus con personas que ya fueron.", communityTitle: "Historias, consejos, fotos y foros", plannerTitle: "Compara rutas con actualizaciones de tráfico", notificationsTitle: "Actualizaciones fiables por email y push", reviewsTitle: "Opiniones de viajes completados" };

const i18nOverrides = {
  en: {
    appTitle: "RouteNest",
    navHome: "Navigation",
    signIn: "Sign In",
    homeBadge: "Join 50,000+ travelers",
    homeTitle: "Journey Together, Share Stories",
    homeBody: "Connect with fellow travelers, discover scenic bus routes, and share unforgettable journey experiences across India.",
    from: "From",
    to: "To",
    searchRoutes: "Search Routes",
    routesLabel: "Routes",
    storiesLabel: "Stories",
    ratingLabel: "Rating",
    liveFeed: "Live Feed",
    viewAllStories: "View All Stories ->",
    priyaStory: "Just completed the most scenic route from Manali to Leh. The views were breathtaking. Highly recommend taking the early morning bus for sunrise views.",
    rahulStory: "Pro tip: Book your tickets at least 2 days in advance for weekend routes. Saved 30% on my Delhi-Jaipur journey.",
    totalLogged: "Total logged",
    deliveredCount: "Delivered",
    retryingCount: "Retrying",
    failedCount: "Failed",
    retries: "Retries",
    sendTestNotification: "Send test notification",
    sendTestBody: "Generate real-time style updates for key bus events. Delivery follows the preferences selected on this page.",
    eventBooking: "Booking confirmation",
    eventCancellation: "Cancellation",
    eventSchedule: "Schedule change",
    eventReminder: "Journey reminder",
    eventPromo: "Promotional offer",
    liveUpdates: "Live updates",
    latestNotifications: "Latest notifications",
    history: "History",
    notificationLog: "Notification log",
    promoOff: "Promotional notifications are turned off.",
    channelRequired: "Please enable at least one channel.",
    notificationCreated: "Notification created and logged in history.",
    commentPlaceholder: "Write your comment here",
    titlePlaceholder: "Best seats on the Jaipur route",
    bodyPlaceholder: "Share practical details from your journey.",
    photoPlaceholder: "https://example.com/photo.jpg",
    reviewPlaceholder: "Share boarding, comfort, timing, and safety details."
    ,
    settingsEyebrow: "Settings",
    settingsTitle: "Language and theme preferences",
    settingsBody: "Choose your preferred language, switch theme instantly, and keep your preferences saved across pages.",
    languageCenter: "Language center",
    chooseLanguage: "Choose display language",
    languageHelp: "The whole interface updates instantly. Missing translations fall back to English.",
    currentLanguage: "Current language",
    themePreview: "Theme preview",
    instantTheme: "Instant theme switching",
    themeHelp: "Use the navbar button to preview light or dark mode without reloading.",
    sampleJourney: "Sample journey card",
    sampleJourneyBody: "Your selected language and theme stay active while moving between pages.",
    savedPreference: "Saved preference",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    lightThemeHelp: "Warm daylight interface",
    darkThemeHelp: "Low-light travel dashboard",
    fallbackTheme: "Fallback theme",
    themeSaved: "Theme saved and applied across pages.",
    routeOptions: "Route options",
    bestTime: "Best time",
    lowestTraffic: "Lowest traffic",
    planJourney: "Plan your journey",
    compareRoutes: "Compare routes",
    suggestedRoutes: "Suggested routes",
    frequentRoutes: "Frequent routes",
    savedRouteList: "Saved route list",
    distance: "Distance",
    estimatedTime: "Estimated time",
    trafficImpact: "Traffic impact",
    delay: "Delay",
    recommended: "Recommended",
    alternateSuggested: "Alternative route suggested because traffic changed.",
    mapProvider: "Map API mock",
    noSavedRoutes: "Saved routes will appear here.",
    trafficUpdated: "Traffic conditions refreshed and route suggestions updated."
  },
  hi: {
    appTitle: "रूटनेस्ट",
    navExplore: "एक्सप्लोर",
    navHome: "नेविगेशन",
    navCommunity: "समुदाय",
    navPlanner: "रूट प्लानर",
    navNotifications: "सूचनाएं",
    navReviews: "समीक्षाएं",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    signIn: "साइन इन",
    homeBadge: "50,000+ यात्रियों से जुड़ें",
    homeTitle: "साथ चलें, कहानियां साझा करें",
    homeBody: "यात्रियों से जुड़ें, सुंदर बस रूट खोजें, और भारत भर की यादगार यात्रा कहानियां साझा करें.",
    from: "कहां से",
    to: "कहां तक",
    searchRoutes: "रूट खोजें",
    routesLabel: "रूट",
    storiesLabel: "कहानियां",
    ratingLabel: "रेटिंग",
    planTrip: "यात्रा प्लान करें",
    joinCommunity: "समुदाय से जुड़ें",
    liveFeed: "लाइव फीड",
    viewAllStories: "सभी कहानियां देखें ->",
    priyaStory: "मनाली से लेह तक का सबसे खूबसूरत रूट पूरा किया. नज़ारे शानदार थे. सूर्योदय देखने के लिए सुबह की बस बेहतर है.",
    rahulStory: "सुझाव: वीकेंड रूट के लिए टिकट कम से कम 2 दिन पहले बुक करें. मेरी दिल्ली-जयपुर यात्रा पर 30% बचत हुई.",
    navigationEyebrow: "नेविगेशन",
    navigationTitle: "आप कहां जाना चाहते हैं",
    navigationBody: "बस यात्रा, समुदाय, अपडेट और समीक्षाओं के लिए सभी RouteNest मॉड्यूल तक तेज पहुंच.",
    navCardCommunity: "यात्री समुदाय",
    navCardCommunityBody: "कहानियां, टिप्स, फोटो, टिप्पणियां, लाइक, रिपोर्ट और फोरम चर्चा साझा करें.",
    navCardPlanner: "रूट प्लानर",
    navCardPlannerBody: "रूट तुलना करें, वेपॉइंट जोड़ें, यात्राएं सेव करें और ट्रैफिक अपडेट देखें.",
    navCardNotifications: "सूचनाएं",
    navCardNotificationsBody: "ईमेल, पुश, ऑफर, रिट्राई, डिलीवरी स्थिति और इतिहास मैनेज करें.",
    navCardReviews: "रूट समीक्षाएं",
    navCardReviewsBody: "पूरी हुई यात्राओं की समीक्षा करें, खराब कंटेंट रिपोर्ट करें और भरोसेमंद समीक्षक खोजें.",
    navCardProfile: "प्रोफाइल गतिविधि",
    navCardProfileBody: "पोस्ट, सेव रूट, समीक्षा, लाइक और हाल की गतिविधि देखें.",
    navCardSettings: "भाषा और थीम",
    navCardSettingsBody: "भाषा बदलें, डार्क मोड इस्तेमाल करें और पसंद सेव रखें.",
    communityEyebrow: "समुदाय",
    communityTitle: "कहानियां, टिप्स, फोटो और फोरम",
    communityBody: "सिर्फ सत्यापित उपयोगकर्ता पोस्ट कर सकते हैं. सभी लोग रूट, जगह और सलाह से सीख सकते हैं.",
    createPost: "पोस्ट बनाएं",
    verifiedUser: "सत्यापित उपयोगकर्ता",
    yes: "हां",
    no: "नहीं",
    forumTopic: "फोरम विषय",
    postTitle: "पोस्ट शीर्षक",
    postBody: "कहानी या टिप",
    photoUrl: "फोटो URL",
    publish: "प्रकाशित करें",
    all: "सभी",
    preferences: "पसंद",
    notificationsEyebrow: "सूचनाएं",
    notificationsTitle: "भरोसेमंद ईमेल और पुश अपडेट",
    notificationsBody: "पसंद, ऑफर, स्थानीय भाषा, डिलीवरी स्थिति, रिट्राई और इतिहास मैनेज करें.",
    emailNotifications: "ईमेल सूचनाएं",
    pushNotifications: "पुश सूचनाएं",
    promoNotifications: "प्रमोशनल ऑफर",
    savePreferences: "पसंद सेव करें",
    totalLogged: "कुल लॉग",
    deliveredCount: "डिलीवर",
    retryingCount: "रिट्राई",
    failedCount: "फेल",
    retries: "रिट्राई",
    sendTestNotification: "टेस्ट सूचना भेजें",
    sendTestBody: "मुख्य बस इवेंट के लिए रियल-टाइम अपडेट बनाएं. डिलीवरी आपकी चुनी गई पसंद के अनुसार होगी.",
    eventBooking: "बुकिंग कन्फर्मेशन",
    eventCancellation: "कैंसलेशन",
    eventSchedule: "शेड्यूल बदलाव",
    eventReminder: "यात्रा रिमाइंडर",
    eventPromo: "प्रमोशनल ऑफर",
    liveUpdates: "लाइव अपडेट",
    latestNotifications: "नई सूचनाएं",
    history: "इतिहास",
    notificationLog: "सूचना लॉग",
    delivered: "डिलीवर",
    retrying: "रिट्राई",
    failed: "फेल",
    retry: "फिर कोशिश",
    promoOff: "प्रमोशनल सूचनाएं बंद हैं.",
    channelRequired: "कृपया कम से कम एक चैनल चालू करें.",
    notificationCreated: "सूचना बन गई और इतिहास में सेव हो गई.",
    prefsSaved: "सूचना पसंद सेव हो गई.",
    plannerEyebrow: "रूट प्लानर",
    plannerTitle: "लाइव ट्रैफिक अपडेट के साथ रूट तुलना करें",
    plannerBody: "वेपॉइंट जोड़ें, दूरी और समय की तुलना करें, पसंदीदा रूट सेव करें और ट्रैफिक अपडेट करें.",
    startLocation: "शुरुआत",
    destination: "गंतव्य",
    waypoints: "वेपॉइंट",
    suggestRoutes: "रूट सुझाएं",
    refreshTraffic: "ट्रैफिक अपडेट",
    reviewsEyebrow: "रूट समीक्षा",
    reviewsTitle: "पूरी हुई यात्राओं से मिली प्रतिक्रिया",
    reviewsBody: "सत्यापित यात्री पूरी हुई यात्रा के बाद एक बार समीक्षा कर सकते हैं.",
    writeReview: "समीक्षा लिखें",
    completedJourney: "यात्रा पूरी हुई",
    routeName: "रूट",
    rating: "रेटिंग",
    reviewText: "समीक्षा",
    submitReview: "समीक्षा भेजें",
    profileEyebrow: "प्रोफाइल गतिविधि",
    profileTitle: "यात्री योगदान",
    verifiedOnly: "सिर्फ सत्यापित उपयोगकर्ता कंटेंट पोस्ट कर सकते हैं.",
    postCreated: "पोस्ट प्रकाशित हुई और प्रोफाइल गतिविधि में जुड़ गई.",
    reviewBlocked: "समीक्षा केवल पूरी हुई यात्रा के बाद की जा सकती है.",
    reviewShort: "समीक्षा कम से कम 30 अक्षरों की होनी चाहिए.",
    reviewDuplicate: "आप इस रूट की समीक्षा पहले ही कर चुके हैं.",
    reviewCreated: "समीक्षा भेज दी गई. आप 24 घंटे के भीतर टेक्स्ट एडिट कर सकते हैं.",
    popular: "लोकप्रिय",
    report: "रिपोर्ट",
    remove: "हटाएं",
    like: "लाइक",
    comment: "टिप्पणी",
    share: "शेयर",
    saveRoute: "रूट सेव करें",
    saved: "सेव हुआ",
    trusted: "भरोसेमंद समीक्षक",
    trafficLow: "कम ट्रैफिक",
    trafficMedium: "मध्यम ट्रैफिक",
    trafficHigh: "भारी ट्रैफिक",
    commentPlaceholder: "अपनी टिप्पणी लिखें",
    titlePlaceholder: "जयपुर रूट की सबसे अच्छी सीटें",
    bodyPlaceholder: "अपनी यात्रा से उपयोगी जानकारी साझा करें.",
    photoPlaceholder: "https://example.com/photo.jpg",
    reviewPlaceholder: "बोर्डिंग, आराम, समय और सुरक्षा की जानकारी साझा करें."
    ,
    settingsEyebrow: "सेटिंग्स",
    settingsTitle: "भाषा और थीम पसंद",
    settingsBody: "अपनी भाषा चुनें, थीम तुरंत बदलें, और पसंद सभी पेजों पर सेव रखें.",
    languageCenter: "भाषा केंद्र",
    chooseLanguage: "डिस्प्ले भाषा चुनें",
    languageHelp: "पूरा इंटरफेस तुरंत बदलता है. कोई अनुवाद न मिले तो अंग्रेजी दिखाई जाएगी.",
    currentLanguage: "वर्तमान भाषा",
    themePreview: "थीम प्रीव्यू",
    instantTheme: "तुरंत थीम बदलें",
    themeHelp: "बिना पेज reload किए light या dark mode preview करें.",
    sampleJourney: "सैंपल यात्रा कार्ड",
    sampleJourneyBody: "आपकी चुनी हुई भाषा और थीम पेज बदलने पर भी active रहती है.",
    savedPreference: "सेव पसंद",
    lightTheme: "लाइट थीम",
    darkTheme: "डार्क थीम",
    lightThemeHelp: "गर्म daylight interface",
    darkThemeHelp: "कम रोशनी के लिए dashboard",
    fallbackTheme: "fallback theme",
    themeSaved: "थीम सेव हो गई और सभी पेजों पर लागू है.",
    routeOptions: "रूट विकल्प",
    bestTime: "सबसे कम समय",
    lowestTraffic: "सबसे कम ट्रैफिक",
    planJourney: "यात्रा प्लान करें",
    compareRoutes: "रूट तुलना",
    suggestedRoutes: "सुझाए गए रूट",
    frequentRoutes: "अक्सर इस्तेमाल रूट",
    savedRouteList: "सेव रूट लिस्ट",
    distance: "दूरी",
    estimatedTime: "अनुमानित समय",
    trafficImpact: "ट्रैफिक प्रभाव",
    delay: "देरी",
    recommended: "सुझाया गया",
    alternateSuggested: "ट्रैफिक बदलने पर वैकल्पिक रूट सुझाया गया.",
    mapProvider: "मैप API मॉक",
    noSavedRoutes: "सेव रूट यहां दिखाई देंगे.",
    trafficUpdated: "ट्रैफिक अपडेट हुआ और रूट सुझाव बदले गए."
  },
  es: {
    appTitle: "RouteNest",
    navExplore: "Explorar",
    navHome: "Navegación",
    navCommunity: "Comunidad",
    navPlanner: "Planificador",
    navNotifications: "Notificaciones",
    navReviews: "Reseñas",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    signIn: "Iniciar sesión",
    homeBadge: "Únete a más de 50,000 viajeros",
    homeTitle: "Viajen juntos, compartan historias",
    homeBody: "Conecta con otros viajeros, descubre rutas escénicas en bus y comparte experiencias inolvidables por India.",
    from: "Desde",
    to: "Hasta",
    searchRoutes: "Buscar rutas",
    routesLabel: "Rutas",
    storiesLabel: "Historias",
    ratingLabel: "Calificación",
    planTrip: "Planear viaje",
    joinCommunity: "Unirse",
    liveFeed: "En vivo",
    viewAllStories: "Ver todas las historias ->",
    priyaStory: "Acabo de completar la ruta escénica de Manali a Leh. Las vistas fueron increíbles. Recomiendo el bus de la mañana para ver el amanecer.",
    rahulStory: "Consejo: reserva tus boletos al menos 2 días antes para rutas de fin de semana. Ahorré 30% en mi viaje Delhi-Jaipur.",
    navigationEyebrow: "Navegación",
    navigationTitle: "Elige a dónde quieres ir",
    navigationBody: "Acceso rápido a módulos de planificación, comunidad, actualizaciones y reseñas.",
    notificationsEyebrow: "Notificaciones",
    notificationsTitle: "Actualizaciones confiables por email y push",
    notificationsBody: "Gestiona preferencias, promociones, localización, entrega, reintentos e historial.",
    preferences: "Preferencias",
    emailNotifications: "Notificaciones por email",
    pushNotifications: "Notificaciones push",
    promoNotifications: "Ofertas promocionales",
    savePreferences: "Guardar preferencias",
    totalLogged: "Total registrado",
    deliveredCount: "Entregadas",
    retryingCount: "Reintentando",
    failedCount: "Fallidas",
    retries: "Reintentos",
    sendTestNotification: "Enviar notificación de prueba",
    sendTestBody: "Genera actualizaciones de eventos clave. La entrega sigue tus preferencias.",
    eventBooking: "Confirmación de reserva",
    eventCancellation: "Cancelación",
    eventSchedule: "Cambio de horario",
    eventReminder: "Recordatorio de viaje",
    eventPromo: "Oferta promocional",
    liveUpdates: "Actualizaciones",
    latestNotifications: "Últimas notificaciones",
    history: "Historial",
    notificationLog: "Registro",
    delivered: "Entregada",
    retrying: "Reintentando",
    failed: "Fallida",
    retry: "Reintentar",
    promoOff: "Las promociones están desactivadas.",
    channelRequired: "Activa al menos un canal.",
    notificationCreated: "Notificación creada y guardada en el historial.",
    prefsSaved: "Preferencias guardadas.",
    commentPlaceholder: "Escribe tu comentario",
    titlePlaceholder: "Mejores asientos en la ruta de Jaipur",
    bodyPlaceholder: "Comparte detalles prácticos de tu viaje.",
    photoPlaceholder: "https://example.com/photo.jpg",
    reviewPlaceholder: "Comparte detalles de abordaje, comodidad, horario y seguridad."
    ,
    settingsEyebrow: "Ajustes",
    settingsTitle: "Preferencias de idioma y tema",
    settingsBody: "Elige tu idioma, cambia el tema al instante y guarda tus preferencias.",
    languageCenter: "Centro de idioma",
    chooseLanguage: "Elegir idioma",
    languageHelp: "La interfaz cambia al instante. Si falta una traducción, se usa inglés.",
    currentLanguage: "Idioma actual",
    themePreview: "Vista del tema",
    instantTheme: "Cambio de tema instantáneo",
    themeHelp: "Usa el botón superior para cambiar modo claro u oscuro sin recargar.",
    sampleJourney: "Tarjeta de viaje",
    sampleJourneyBody: "Tu idioma y tema permanecen activos entre páginas.",
    savedPreference: "Preferencia guardada",
    lightTheme: "Tema claro",
    darkTheme: "Tema oscuro",
    lightThemeHelp: "Interfaz clara y cálida",
    darkThemeHelp: "Panel para poca luz",
    fallbackTheme: "Tema por defecto",
    themeSaved: "Tema guardado y aplicado en todas las páginas.",
    routeOptions: "Opciones",
    bestTime: "Mejor tiempo",
    lowestTraffic: "Menos tráfico",
    planJourney: "Planear viaje",
    compareRoutes: "Comparar rutas",
    suggestedRoutes: "Rutas sugeridas",
    frequentRoutes: "Rutas frecuentes",
    savedRouteList: "Rutas guardadas",
    distance: "Distancia",
    estimatedTime: "Tiempo estimado",
    trafficImpact: "Impacto de tráfico",
    delay: "Retraso",
    recommended: "Recomendada",
    alternateSuggested: "Ruta alternativa sugerida por cambio de tráfico.",
    mapProvider: "Mock de API de mapas",
    noSavedRoutes: "Las rutas guardadas aparecerán aquí.",
    trafficUpdated: "Tráfico actualizado y rutas sugeridas recalculadas."
  }
};

Object.keys(i18nOverrides).forEach((language) => {
  translations[language] = { ...(translations.en || {}), ...(translations[language] || {}), ...i18nOverrides[language] };
});

const defaultState = {
  theme: "light",
  language: "en",
  currentTopic: "All",
  notificationPrefs: { email: true, push: true, promo: false },
  posts: [
    {
      id: 1,
      author: "Aarav Mehta",
      verified: true,
      topic: "Routes",
      title: "Night bus from Pune to Goa",
      body: "Book the left-side sleeper seats if you want sunrise views near the ghats.",
      photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
      likes: 42,
      comments: ["Carry a light jacket.", "The food stop near Kolhapur is reliable."],
      reports: 0,
      removed: false
    },
    {
      id: 2,
      author: "Maya Shah",
      verified: true,
      topic: "Travel Advice",
      title: "What helped on my first solo bus trip",
      body: "Save your ticket offline, share live location with family, and keep small cash ready.",
      photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      likes: 35,
      comments: ["Great checklist.", "Offline ticket saved me once."],
      reports: 1,
      removed: false
    }
  ],
  routes: [],
  savedRoutes: [],
  notifications: [
    { id: 1, type: "booking", channel: "email", status: "delivered", text: { en: "Booking confirmed for Mumbai to Pune.", hi: "मुंबई से पुणे की बुकिंग कन्फर्म हो गई.", es: "Reserva confirmada de Mumbai a Pune." }, retries: 0, createdAt: "2026-04-17 10:00" },
    { id: 2, type: "schedule", channel: "push", status: "retrying", text: { en: "Your bus is delayed by 18 minutes.", hi: "आपकी बस 18 मिनट देरी से है.", es: "Tu bus tiene 18 minutos de retraso." }, retries: 1, createdAt: "2026-04-17 10:12" },
    { id: 3, type: "reminder", channel: "push", status: "delivered", text: { en: "Journey reminder: boarding starts in 45 minutes.", hi: "यात्रा रिमाइंडर: बोर्डिंग 45 मिनट में शुरू होगी.", es: "Recordatorio: el embarque empieza en 45 minutos." }, retries: 0, createdAt: "2026-04-17 10:20" }
  ],
  reviews: [
    { id: 1, route: "Mumbai to Pune", user: "Aarav Mehta", verified: true, completedJourney: true, rating: 5, text: "Clean bus, smooth boarding, and the driver kept stops organized.", helpful: 18, reports: 0, hidden: false },
    { id: 2, route: "Delhi to Jaipur", user: "Maya Shah", verified: true, completedJourney: true, rating: 4, text: "Good timing and clear announcements, though the last rest stop was crowded.", helpful: 13, reports: 0, hidden: false }
  ],
  activity: ["Aarav liked a route story.", "Maya reviewed Delhi to Jaipur.", "Riya saved Mumbai to Pune via Lonavala."]
};

let state = loadState();
if (!translations[state.language]) state.language = "en";
state.theme = normalizeTheme(state.theme);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(defaultState);
  try {
    return { ...clone(defaultState), ...JSON.parse(saved) };
  } catch {
    return clone(defaultState);
  }
}

function saveState() {
  state.theme = normalizeTheme(state.theme);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeTheme(theme) {
  return ALLOWED_THEMES.includes(theme) ? theme : defaultState.theme;
}

function setTheme(theme) {
  state.theme = normalizeTheme(theme);
  saveState();
  render();
}

function t(key) {
  const language = translations[state.language] || translations.en;
  return language[key] || translations.en[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = "ltr";
  document.title = `${t("appTitle")} ${document.body.dataset.pageName ? "| " + t(document.body.dataset.pageName) : ""}`;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  document.querySelectorAll("[data-i18n-value]").forEach((node) => {
    node.value = t(node.dataset.i18nValue);
  });
  if (document.getElementById("themeToggle")) {
    document.getElementById("themeToggle").textContent = state.theme === "dark" ? t("lightMode") : t("darkMode");
  }
  renderLanguageSettings();
}

function renderLanguageSettings() {
  const labels = { en: "English", hi: "हिन्दी", es: "Español" };
  document.querySelectorAll("[data-set-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.setLanguage === state.language);
  });
  if (document.getElementById("currentLanguageLabel")) {
    document.getElementById("currentLanguageLabel").textContent = labels[state.language] || labels.en;
  }
  if (document.getElementById("savedPreferenceLabel")) {
    document.getElementById("savedPreferenceLabel").textContent = state.theme === "dark" ? t("darkTheme") : t("lightTheme");
  }
  if (document.getElementById("fallbackThemeLabel")) {
    document.getElementById("fallbackThemeLabel").textContent = t("lightTheme");
  }
  document.querySelectorAll("[data-set-theme]").forEach((button) => {
    const active = button.dataset.setTheme === state.theme;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function render() {
  state.theme = normalizeTheme(state.theme);
  document.documentElement.classList.toggle("dark", state.theme === "dark");
  document.documentElement.dataset.theme = state.theme;
  if (document.getElementById("languageSelect")) document.getElementById("languageSelect").value = state.language;
  if (document.getElementById("emailPref")) document.getElementById("emailPref").checked = state.notificationPrefs.email;
  if (document.getElementById("pushPref")) document.getElementById("pushPref").checked = state.notificationPrefs.push;
  if (document.getElementById("promoPref")) document.getElementById("promoPref").checked = state.notificationPrefs.promo;
  applyTranslations();
  renderCommunity();
  renderCommunityStats();
  renderForumBoards();
  renderModerationQueue();
  renderRoutes();
  renderNotifications();
  renderReviews();
  renderActivity();
  renderStats();
}

function renderStats() {
  if (!document.getElementById("postCount")) return;
  const visiblePosts = state.posts.filter((post) => !post.removed);
  const visibleReviews = state.reviews.filter((review) => !review.hidden);
  const average = visibleReviews.length
    ? visibleReviews.reduce((sum, review) => sum + Number(review.rating), 0) / visibleReviews.length
    : 0;

  document.getElementById("postCount").textContent = visiblePosts.length;
  document.getElementById("savedRouteCount").textContent = state.savedRoutes.length;
  document.getElementById("averageRating").textContent = average.toFixed(1);
}

function renderCommunity() {
  const postsGrid = document.getElementById("postsGrid");
  if (!postsGrid) return;
  const visiblePosts = state.posts.filter((post) => !post.removed);
  const filtered = state.currentTopic === "All" ? visiblePosts : visiblePosts.filter((post) => post.topic === state.currentTopic);
  const popular = [...visiblePosts].sort((a, b) => b.likes + b.comments.length - (a.likes + a.comments.length))[0];

  document.querySelectorAll(".topic-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.topic === state.currentTopic);
  });

  document.getElementById("highlightPost").innerHTML = popular
    ? `<strong>${t("popular")}: ${popular.title}</strong><p>${popular.body}</p><span class="pill">${popular.likes} ${t("like")}</span>`
    : "";

  postsGrid.innerHTML = filtered.map((post) => `
    <article class="post-card">
      ${post.photo ? `<img src="${post.photo}" alt="${post.title}">` : ""}
      <div class="card-body">
        <div class="meta"><span class="pill">${post.topic}</span><span>${post.author}</span><span>${post.verified ? "Verified" : ""}</span></div>
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <div class="meta">${post.comments.map((comment) => `<span>${comment}</span>`).join("")}</div>
        <div class="card-actions">
          <button type="button" data-action="like" data-id="${post.id}">${t("like")} (${post.likes})</button>
          <button type="button" data-action="report" data-id="${post.id}">${t("report")} (${post.reports})</button>
          <button type="button" data-action="share" data-id="${post.id}">${t("share")}</button>
          ${post.reports >= 2 ? `<button type="button" data-action="remove" data-id="${post.id}">${t("remove")}</button>` : ""}
        </div>
        <div class="comment-box">
          <input type="text" data-comment-input="${post.id}" placeholder="${t("commentPlaceholder")}" aria-label="${t("comment")}">
          <button type="button" data-action="add-comment" data-id="${post.id}">${t("comment")}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCommunityStats() {
  if (!document.getElementById("verifiedPostCount")) return;
  const visiblePosts = state.posts.filter((post) => !post.removed);
  const verifiedPosts = visiblePosts.filter((post) => post.verified);
  const likes = visiblePosts.reduce((sum, post) => sum + post.likes, 0);
  const comments = visiblePosts.reduce((sum, post) => sum + post.comments.length, 0);
  const reports = state.posts.reduce((sum, post) => sum + post.reports, 0);

  document.getElementById("verifiedPostCount").textContent = verifiedPosts.length;
  document.getElementById("communityLikeCount").textContent = likes;
  document.getElementById("communityCommentCount").textContent = comments;
  document.getElementById("communityReportCount").textContent = reports;
}

function renderForumBoards() {
  if (!document.getElementById("forumBoards")) return;
  const topics = ["Routes", "Destinations", "Travel Advice"];
  document.getElementById("forumBoards").innerHTML = topics.map((topic) => {
    const posts = state.posts.filter((post) => post.topic === topic && !post.removed);
    const engagement = posts.reduce((sum, post) => sum + post.likes + post.comments.length, 0);
    return `
      <button class="forum-board" type="button" data-forum-topic="${topic}">
        <span class="pill">${topic}</span>
        <strong>${posts.length} posts</strong>
        <small>${engagement} interactions</small>
      </button>
    `;
  }).join("");
}

function renderModerationQueue() {
  if (!document.getElementById("moderationQueue")) return;
  const reported = state.posts.filter((post) => post.reports > 0 && !post.removed);
  document.getElementById("moderationQueue").innerHTML = reported.length
    ? reported.map((post) => `
      <article class="notice-card">
        <div class="meta"><span class="pill">${post.topic}</span><span>${post.reports} reports</span></div>
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <div class="card-actions">
          <button type="button" data-action="clear-report" data-id="${post.id}">Mark safe</button>
          <button type="button" data-action="remove" data-id="${post.id}">${t("remove")}</button>
        </div>
      </article>
    `).join("")
    : `<article class="notice-card"><h3>No posts waiting for review</h3><p>Reported posts will appear here for moderator action.</p></article>`;
}

function buildRoutes(start, destination, waypoints) {
  const trafficLevels = [
    { key: "trafficLow", label: t("trafficLow"), congestion: "24%", delay: 8, factor: 0 },
    { key: "trafficMedium", label: t("trafficMedium"), congestion: "52%", delay: 18, factor: 1 },
    { key: "trafficHigh", label: t("trafficHigh"), congestion: "81%", delay: 34, factor: 2 }
  ];

  const routes = ["Express Corridor", "Scenic Highway", "Early Boarding Alternate"].map((name, index) => {
    const traffic = trafficLevels[(Math.floor(Date.now() / 30000) + index) % trafficLevels.length];
    const distance = 145 + index * 12 + waypoints.length * 8;
    const time = 170 + index * 16 + traffic.factor * 14 + waypoints.length * 7;
    return {
      id: `${start}-${destination}-${index}`,
      name: `${start} to ${destination}: ${name}`,
      summary: index === 2 ? "Suggested alternate when congestion rises near the main terminal." : "Balanced route with live traffic estimates from map data.",
      distance,
      time,
      delay: traffic.delay,
      congestion: traffic.congestion,
      impact: `${traffic.delay} min`,
      trafficLabel: traffic.label,
      trafficKey: traffic.key,
      waypoints,
      recommended: false
    };
  });

  const best = [...routes].sort((a, b) => a.time + a.delay - (b.time + b.delay))[0];
  best.recommended = true;
  return routes;
}

function currentRoutes() {
  return state.routes.length ? state.routes : buildRoutes("Mumbai", "Pune", ["Lonavala"]);
}

function renderRoutes() {
  if (!document.getElementById("routesGrid")) return;
  const routes = currentRoutes();
  renderPlannerStats(routes);
  renderMapMeta(routes);
  renderSavedRoutesList();
  const suggested = routes.find((route) => route.recommended);
  if (document.getElementById("alternativeHint")) {
    document.getElementById("alternativeHint").textContent = suggested ? `${t("recommended")}: ${suggested.name}. ${t("alternateSuggested")}` : "";
  }
  document.getElementById("routesGrid").innerHTML = routes.map((route) => {
    const saved = state.savedRoutes.some((item) => item.id === route.id);
    return `
      <article class="route-card ${route.recommended ? "recommended-route" : ""}">
        <div class="card-body">
          <div class="meta"><span class="pill">${route.trafficLabel}</span>${route.recommended ? `<span class="pill">${t("recommended")}</span>` : ""}</div>
          <h3>${route.name}</h3>
          <p>${route.summary}</p>
          <div class="route-metrics">
            <span><strong>${route.distance} km</strong>${t("distance")}</span>
            <span><strong>${route.time} min</strong>${t("estimatedTime")}</span>
            <span><strong>${route.congestion}</strong>${t("trafficImpact")}</span>
            <span><strong>${route.delay} min</strong>${t("delay")}</span>
          </div>
          <div class="status-row"><span>${t("waypoints")}: ${route.waypoints.join(", ") || "None"}</span></div>
          <button type="button" data-action="save-route" data-id="${route.id}">${saved ? t("saved") : t("saveRoute")}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderPlannerStats(routes) {
  if (!document.getElementById("routeOptionCount")) return;
  const best = [...routes].sort((a, b) => a.time - b.time)[0];
  const low = routes.find((route) => route.trafficKey === "trafficLow") || [...routes].sort((a, b) => a.delay - b.delay)[0];
  document.getElementById("routeOptionCount").textContent = routes.length;
  document.getElementById("bestTimeStat").textContent = `${best.time}m`;
  document.getElementById("lowestTrafficStat").textContent = low.trafficLabel.replace(" traffic", "");
  document.getElementById("savedPlannerCount").textContent = state.savedRoutes.length;
}

function renderMapMeta(routes) {
  if (!document.getElementById("mapMeta")) return;
  const best = routes.find((route) => route.recommended) || routes[0];
  document.getElementById("mapMeta").innerHTML = `
    <span class="pill">${t("mapProvider")}</span>
    <strong>${best.name}</strong>
    <small>${best.distance} km · ${best.time} min · ${best.trafficLabel}</small>
  `;
}

function renderSavedRoutesList() {
  if (!document.getElementById("savedRoutesList")) return;
  document.getElementById("savedRoutesList").innerHTML = state.savedRoutes.length
    ? state.savedRoutes.map((route) => `
      <article class="notice-card compact-notice">
        <div class="meta"><span class="pill">${route.trafficLabel}</span><span>${route.distance} km</span><span>${route.time} min</span></div>
        <h3>${route.name}</h3>
        <p>${t("waypoints")}: ${route.waypoints.join(", ") || "None"}</p>
      </article>
    `).join("")
    : `<article class="notice-card"><p>${t("noSavedRoutes")}</p></article>`;
}

function renderNotifications() {
  if (!document.getElementById("notificationList")) return;
  renderNotificationStats();
  const sorted = [...state.notifications].sort((a, b) => b.id - a.id);
  document.getElementById("notificationList").innerHTML = sorted.slice(0, 5).map((notice) => `
    <article class="notice-card">
      <div class="meta"><span class="pill">${notice.channel}</span><span>${notice.type}</span></div>
      <h3>${localizedNoticeText(notice)}</h3>
      <div class="status-row"><span class="status-pill status-${notice.status}">${t(notice.status)}</span><span>${t("retries")}: ${notice.retries}</span><span>${notice.createdAt || "Just now"}</span></div>
      ${notice.status !== "delivered" ? `<button type="button" data-action="retry-notice" data-id="${notice.id}">${t("retry")}</button>` : ""}
    </article>
  `).join("");

  if (document.getElementById("notificationHistory")) {
    document.getElementById("notificationHistory").innerHTML = sorted.map((notice) => `
      <article class="notice-card compact-notice">
        <div class="meta"><span class="pill">${notice.channel}</span><span>${notice.type}</span><span class="status-pill status-${notice.status}">${t(notice.status)}</span></div>
        <p>${localizedNoticeText(notice)}</p>
        <div class="status-row"><span>${t("retries")}: ${notice.retries}</span><span>${notice.createdAt || "Just now"}</span></div>
      </article>
    `).join("");
  }
}

function localizedNoticeText(notice) {
  const template = notificationTemplates(notice.type);
  const direct = notice.text?.[state.language];
  if (!direct || direct.includes("à")) return template[state.language] || template.en;
  return direct;
}

function renderNotificationStats() {
  if (!document.getElementById("totalNotificationCount")) return;
  document.getElementById("totalNotificationCount").textContent = state.notifications.length;
  document.getElementById("deliveredNotificationCount").textContent = state.notifications.filter((notice) => notice.status === "delivered").length;
  document.getElementById("retryNotificationCount").textContent = state.notifications.filter((notice) => notice.status === "retrying").length;
  document.getElementById("failedNotificationCount").textContent = state.notifications.filter((notice) => notice.status === "failed").length;
}

function notificationTemplates(type) {
  const templates = {
    booking: {
      en: "Booking confirmed for Mumbai to Pune. Your seat and ticket details are ready.",
      hi: "मुंबई से पुणे की बुकिंग कन्फर्म हो गई. सीट और टिकट विवरण तैयार हैं.",
      es: "Reserva confirmada de Mumbai a Pune. Tu asiento y boleto están listos."
    },
    cancellation: {
      en: "Your Delhi to Jaipur booking has been cancelled and refund processing has started.",
      hi: "दिल्ली से जयपुर बुकिंग रद्द हो गई है और रिफंड प्रक्रिया शुरू हो गई है.",
      es: "Tu reserva de Delhi a Jaipur fue cancelada y el reembolso comenzó."
    },
    schedule: {
      en: "Schedule change: your bus will now depart 25 minutes later than planned.",
      hi: "शेड्यूल बदलाव: आपकी बस अब तय समय से 25 मिनट बाद चलेगी.",
      es: "Cambio de horario: tu bus saldrá 25 minutos más tarde."
    },
    reminder: {
      en: "Upcoming journey reminder: boarding starts in 45 minutes.",
      hi: "आने वाली यात्रा रिमाइंडर: बोर्डिंग 45 मिनट में शुरू होगी.",
      es: "Recordatorio de viaje: el embarque empieza en 45 minutos."
    },
    promo: {
      en: "Limited offer: save 15% on your next verified bus route booking.",
      hi: "सीमित ऑफर: अगली सत्यापित बस रूट बुकिंग पर 15% बचाएं.",
      es: "Oferta limitada: ahorra 15% en tu próxima reserva de bus."
    }
  };
  return templates[type] || templates.booking;
}

function timestamp() {
  return new Date().toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function deliveryStatus(channel, type) {
  if (type === "schedule" && channel === "push") return "retrying";
  if (type === "cancellation" && channel === "email") return "failed";
  return "delivered";
}

function createNotification(type) {
  const message = document.getElementById("notificationEventMessage");
  if (type === "promo" && !state.notificationPrefs.promo) {
    message.textContent = t("promoOff");
    return;
  }

  const channels = [];
  if (state.notificationPrefs.email) channels.push("email");
  if (state.notificationPrefs.push) channels.push("push");

  if (!channels.length) {
    message.textContent = t("channelRequired");
    return;
  }

  channels.forEach((channel) => {
    state.notifications.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      channel,
      status: deliveryStatus(channel, type),
      text: notificationTemplates(type),
      retries: 0,
      createdAt: timestamp()
    });
  });

  state.activity.unshift(`Notification sent for ${type}.`);
  message.textContent = t("notificationCreated");
  saveState();
  renderNotifications();
}

function renderReviews() {
  if (!document.getElementById("reviewsList")) return;
  const visibleReviews = state.reviews.filter((review) => !review.hidden);
  const trusted = visibleReviews.filter((review) => review.helpful >= 12);

  document.getElementById("trustedReviewers").innerHTML = trusted.map((review) => `<span class="pill">${review.user} · ${t("trusted")}</span>`).join("");
  document.getElementById("reviewsList").innerHTML = visibleReviews.map((review) => `
    <article class="review-card">
      <div class="meta"><span class="pill">${review.route}</span><span>${review.user}</span><span>${"★".repeat(review.rating)}</span></div>
      <p>${review.text}</p>
      <div class="status-row"><span>Helpful: ${review.helpful}</span><span>Reports: ${review.reports}</span></div>
      <div class="card-actions">
        <button type="button" data-action="helpful-review" data-id="${review.id}">${t("like")}</button>
        <button type="button" data-action="report-review" data-id="${review.id}">${t("report")}</button>
      </div>
    </article>
  `).join("");
}

function renderActivity() {
  if (!document.getElementById("activityFeed")) return;
  const activity = [
    ...state.activity,
    ...state.posts.filter((post) => !post.removed).slice(0, 2).map((post) => `${post.author} posted: ${post.title}`),
    ...state.reviews.filter((review) => !review.hidden).slice(0, 2).map((review) => `${review.user} reviewed ${review.route}`)
  ];

  document.getElementById("activityFeed").innerHTML = activity.slice(0, 6).map((item) => `<article class="activity-card">${item}</article>`).join("");
}

document.getElementById("themeToggle")?.addEventListener("click", () => {
  setTheme(state.theme === "dark" ? "light" : "dark");
});

document.querySelectorAll("[data-set-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(button.dataset.setTheme);
  });
});

document.getElementById("languageSelect")?.addEventListener("change", (event) => {
  state.language = event.target.value;
  saveState();
  render();
});

document.querySelectorAll("[data-set-language]").forEach((button) => {
  button.addEventListener("click", () => {
    state.language = button.dataset.setLanguage;
    saveState();
    render();
  });
});

document.querySelectorAll(".topic-button").forEach((button) => {
  button.addEventListener("click", () => {
    state.currentTopic = button.dataset.topic;
    renderCommunity();
  });
});

document.getElementById("postForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("postMessage");
  const verified = document.getElementById("verifiedInput").value === "true";

  if (!verified) {
    message.textContent = t("verifiedOnly");
    return;
  }

  state.posts.unshift({
    id: Date.now(),
    author: "Verified Traveler",
    verified: true,
    topic: document.getElementById("topicInput").value,
    title: document.getElementById("titleInput").value,
    body: document.getElementById("bodyInput").value,
    photo: document.getElementById("photoInput").value || "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
    likes: 0,
    comments: [],
    reports: 0,
    removed: false
  });

  state.activity.unshift("You created a verified community post.");
  message.textContent = t("postCreated");
  event.target.reset();
  saveState();
  render();
});

document.getElementById("routeForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const start = document.getElementById("startInput").value.trim();
  const destination = document.getElementById("destinationInput").value.trim();
  const waypoints = document.getElementById("waypointInput").value.split(",").map((item) => item.trim()).filter(Boolean);
  state.routes = buildRoutes(start, destination, waypoints);
  if (document.getElementById("trafficUpdateMessage")) document.getElementById("trafficUpdateMessage").textContent = t("alternateSuggested");
  saveState();
  render();
});

document.getElementById("refreshTraffic")?.addEventListener("click", () => {
  state.routes = buildRoutes(
    document.getElementById("startInput").value.trim() || "Mumbai",
    document.getElementById("destinationInput").value.trim() || "Pune",
    document.getElementById("waypointInput").value.split(",").map((item) => item.trim()).filter(Boolean)
  );
  if (document.getElementById("trafficUpdateMessage")) document.getElementById("trafficUpdateMessage").textContent = t("trafficUpdated");
  saveState();
  render();
});

document.getElementById("notificationPrefs")?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.notificationPrefs = {
    email: document.getElementById("emailPref").checked,
    push: document.getElementById("pushPref").checked,
    promo: document.getElementById("promoPref").checked
  };
  document.getElementById("prefMessage").textContent = t("prefsSaved");
  saveState();
  renderNotifications();
});

document.querySelectorAll("[data-notification-event]").forEach((button) => {
  button.addEventListener("click", () => {
    createNotification(button.dataset.notificationEvent);
  });
});

document.getElementById("reviewForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.getElementById("reviewMessage");
  const route = document.getElementById("reviewRouteInput").value;
  const text = document.getElementById("reviewTextInput").value.trim();

  if (document.getElementById("completedInput").value !== "true") {
    message.textContent = t("reviewBlocked");
    return;
  }

  if (text.length < 30) {
    message.textContent = t("reviewShort");
    return;
  }

  if (state.reviews.some((review) => review.route === route && review.user === "Verified Traveler" && !review.hidden)) {
    message.textContent = t("reviewDuplicate");
    return;
  }

  state.reviews.unshift({
    id: Date.now(),
    route,
    user: "Verified Traveler",
    verified: true,
    completedJourney: true,
    rating: Number(document.getElementById("ratingInput").value),
    text,
    helpful: 0,
    reports: 0,
    hidden: false
  });

  state.activity.unshift(`You reviewed ${route}.`);
  message.textContent = t("reviewCreated");
  event.target.reset();
  saveState();
  render();
});

document.body.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "like") state.posts.find((item) => item.id === id).likes += 1;
  if (action === "like") state.activity.unshift("You liked a community post.");
  if (action === "add-comment") {
    const input = document.querySelector(`[data-comment-input="${id}"]`);
    const comment = input.value.trim();
    if (!comment) {
      input.focus();
      return;
    }
    state.posts.find((item) => item.id === id).comments.push(comment);
    state.activity.unshift("You commented on a traveler story.");
  }
  if (action === "report") {
    state.posts.find((item) => item.id === id).reports += 1;
    state.activity.unshift("You reported content for moderation review.");
  }
  if (action === "clear-report") {
    state.posts.find((item) => item.id === id).reports = 0;
    state.activity.unshift("Moderator marked a reported post as safe.");
  }
  if (action === "remove") {
    state.posts.find((item) => item.id === id).removed = true;
    state.activity.unshift("Moderator removed inappropriate content.");
  }
  if (action === "share") {
    const post = state.posts.find((item) => item.id === id);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.title} on RouteNest`)}`;
    state.activity.unshift("You shared a community post externally.");
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }
  if (action === "save-route") {
    const route = currentRoutes().find((item) => item.id === button.dataset.id);
    if (route && !state.savedRoutes.some((item) => item.id === route.id)) {
      state.savedRoutes.push(route);
      state.activity.unshift(`You saved ${route.name}.`);
    }
  }
  if (action === "retry-notice") {
    const notice = state.notifications.find((item) => item.id === id);
    notice.retries += 1;
    notice.status = notice.retries >= 2 ? "delivered" : "retrying";
    notice.createdAt = timestamp();
    state.activity.unshift(`Retried ${notice.channel} notification for ${notice.type}.`);
  }
  if (action === "helpful-review") state.reviews.find((item) => item.id === id).helpful += 1;
  if (action === "report-review") {
    const review = state.reviews.find((item) => item.id === id);
    review.reports += 1;
    if (review.reports >= 2) review.hidden = true;
  }

  saveState();
  render();
});

document.body.addEventListener("click", (event) => {
  const board = event.target.closest("[data-forum-topic]");
  if (!board) return;

  state.currentTopic = board.dataset.forumTopic;
  document.getElementById("community").scrollIntoView({ behavior: "smooth" });
  saveState();
  render();
});

render();
