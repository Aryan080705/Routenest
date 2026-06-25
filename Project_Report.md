# Detailed Project Report: RouteNest - Intelligent Travel & Community Platform

## 1. Introduction
RouteNest is an intelligent, full-stack travel and community platform. It allows users to plan routes using live traffic data, engage in community discussions, and read/write trusted journey reviews. This report provides an in-depth breakdown of every page, feature, button, and the underlying logic that powers the platform.

---

## 2. The Importance of Authentication (Login / Signup)
**Why is Login Required?**
RouteNest operates on a strict identity model to ensure platform safety and data integrity. 
- **Guest Users (Not Logged In):** Can browse the platform, view routes on the planner, read community posts, and read reviews. However, they are in "Read-Only" mode.
- **Logged-In Users:** Gain the ability to save routes, customize notification preferences, and set dark mode / language preferences.
- **Verified Users:** Only logged-in, verified users can actively contribute content (create posts, submit reviews).

### The Auth Modal (Header)
- **Login Button:** Prompts the user for their Email and Password. (Note: For demo stability, if an account disappears from the serverless backend memory, logging in automatically reconstructs the account).
- **Signup Button:** Prompts for Name, Email, and Password to register a new user and securely store their session via JWT (JSON Web Tokens).
- **Logout Button:** Clears the user's secure session and returns them to Guest mode.

---

## 3. Page-by-Page Feature Breakdown

### 3.1. Header & Navigation (Available on all pages)
- **Navigation Links:** Quick links to Home, Planner, Community, Reviews, Notifications, and Profile.
- **Language Dropdown:** Instantly translates the entire app UI (English, Hindi, Spanish) using `react-i18next`. The choice is saved to the user's database profile.
- **Theme Toggle (🌙/☀️):** Switches between Dark Mode and Light Mode seamlessly.

### 3.2. Home Page (`/`)
- **"Plan Your Journey" Button:** A quick Call-to-Action (CTA) that redirects the user to the Route Planner.
- **"Join the Community" Button:** Redirects the user to the Forums/Community page.
- Explains the core philosophy of RouteNest to first-time visitors.

### 3.3. Route Planner Page (`/planner`)
This page integrates the TomTom API and React-Leaflet to provide intelligent mapping.
- **Source & Destination Inputs:** Text fields to enter the starting point and final destination.
- **"Add Waypoint" Button:** Allows users to add up to 3 intermediate stops to their journey.
- **"Generate Route" Button:** Fetches the best possible routes from the backend mapping service.
- **Interactive Map:** Visually draws the paths. Clicking on different colored paths on the map changes the active route.
- **"Save Route" Button:** (Requires Login) Saves the currently selected route to the user's profile for future access.
- **"Refresh Traffic" Button:** Manually polls the API to fetch the latest congestion data and ETAs.
- **"Live Traffic" Toggle Switch:** When turned on, it automatically refreshes the route's traffic data every 3 minutes.
- **Comparison Table:** Lists all alternate routes.
  - **"Select" Button:** Clicking this on a specific row highlights that exact route on the map.
  - **Sorting Tabs:** Buttons to sort the table by "Recommended", "Distance", "ETA", or "Congestion".

### 3.4. Community & Forums Page (`/community`)
A social hub for travelers to interact.
- **"New Post" Button:** (Requires Verified Status). Opens a form with:
  - **Title & Body Inputs:** For the post content.
  - **Topic Dropdown:** To categorize the post (Routes, Destinations, Travel Tips).
  - **Upload Photo Button:** Allows attaching a journey image.
  - **"Post" Button:** Submits the content to the live feed.
- **Feed Tabs ("Latest", "Trending", "Forums"):** 
  - *Trending* automatically ranks posts based on the number of likes received in the last 7 days.
- **Post Action Buttons:**
  - **"Like (♥)" Button:** Toggles a like on the post, updating the count in real-time.
  - **"Comment (💬)" Button:** Opens a text box to reply to the post. Replies can also be nested.
  - **"Share (↗)" Buttons:** Quickly share the post to WhatsApp, Facebook, or copy the direct link.
  - **"Report (⚑)" Button:** Flags inappropriate content. *Logic: If a post receives 3 reports, the system automatically hides it from the feed.*
  - **"Edit (✎)" Button:** Only visible to the author. Allows editing the post, but strictly displays a **countdown timer** because edits are locked after 24 hours.
  - **"Delete" Button:** Permanently removes the post.

### 3.5. Journey Reviews Page (`/reviews`)
A trusted ecosystem for route feedback.
- **"🧪 Simulate Journey" Button:** (Demo feature). Because users can *only* review journeys they have actually traveled, this button simulates a completed trip (e.g., "Delhi to Jaipur") so the user can test the review system.
- **"Select Completed Journey" Dropdown:** Forces the user to attach their review to an actual completed route.
- **Star Rating (★) & Text Box:** To write the review (minimum 30 characters required).
- **"Submit" Button:** Posts the review.
- **"Helpful (👍)" Button:** Clicking this casts a vote saying the review was useful. This button is the secret to earning the Trusted Reviewer badge (explained below).
- **"Edit / Report" Buttons:** Similar 24-hour edit lock and reporting mechanics as the community posts.

### 3.6. Notifications Page (`/notifications`)
- **Real-time Feed:** Displays alerts (e.g., "Someone liked your post") pushed instantly via WebSockets without needing a page refresh.
- **"Mark all as read" Button:** Clears the unread status indicators across the app.

### 3.7. Profile & Settings Page (`/profile`)
- **Profile Header:** Displays the user's Avatar, Name, Email, Total Posts, Total Followers, and Engagement Stats.
- **"Request Verification" Button:** (Crucial Action). Clicked by the user to become verified.
- **"Apply for Trusted Reviewer" Button:** A portal for users to track their trusted status.
- **Tabs (Posts, Reviews, Travel History, Preferences):** Allows users to look back at their activity.
- **Preferences Tab:** Contains checkbox toggles for **Email Notifications, Push Notifications, and Promos**. Clicking these instantly saves the preferences to the backend database.

---

## 4. The Badge & Trust Ecosystem (How it Works)

To prevent spam and ensure high-quality content, RouteNest implements a two-tier badge system.

### Tier 1: Verified User Badge (⭐ Verified)
- **What is it?** A primary security layer.
- **Why is it needed?** By default, a newly signed-up user is restricted. They cannot spam the community feed or fake reviews. 
- **How to get it:** The user must go to their Profile Page and click the **"Request Verification"** button. In a real-world scenario, this would trigger OTP/KYC. In this project, it instantly grants the user the `⭐ Verified` badge. 
- **Perk:** Unlocks the "New Post" button in the Community and the "Submit" button in Reviews.

### Tier 2: Trusted Reviewer Badge (⭐ Trusted)
- **What is it?** A prestige badge awarded only to the most helpful contributors.
- **Why is it needed?** To help readers instantly identify highly accurate, high-quality reviews from veteran travelers.
- **How to get it (The Algorithm):** 
  - This badge **cannot be bought or manually requested**. It is strictly earned.
  - Every time a user writes a review, other users can click the **"👍 Helpful"** button on that review.
  - The backend constantly monitors these votes. Once a single user accumulates a total of **5 Helpful Votes** across all their reviews combined, the backend algorithm (`recomputeTrustedFor`) automatically upgrades their account.
  - **Perk:** The user is instantly awarded the red `⭐ Trusted` badge, which appears next to their name on every review and profile page, signifying their elite status.
