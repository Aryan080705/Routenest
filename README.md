# RouteNest

RouteNest is a responsive bus travel community and journey platform prototype created as a separate project folder.

## Features Covered

- Verified-user community posts with stories, tips, photos, likes, comments, forum topics, reporting, moderation review, removal, social sharing, profile activity, and popular content highlights.
- Notification center with email and push preferences, promotional opt-in, localized messages, delivery status, retry controls, and notification history.
- Internationalization with a language selector, persisted preference, dynamic switching, translated UI labels, validation text, notification labels, and fallback text.
- Interactive route planning with start, destination, waypoints, route comparison, traffic status, alternate suggestions, saved routes, and dynamic traffic refresh.
- Dark mode toggle with instant preview and persisted preference.
- Verified post-journey route reviews with one review per journey, minimum length validation, 24-hour edit window messaging, moderation reporting, average rating calculation excluding hidden reviews, and trusted reviewer highlights.

## How To Run

Open `frontend/index.html` directly in a browser for the frontend demo.

To run the local API and frontend together:

```bash
npm start
```

Then open `http://localhost:4173`.

## Hosting

For Netlify or Vercel, deploy the `frontend` folder as a static site. Keep the live link active until evaluation is completed.

The backend in `backend/server.js` uses Node's built-in HTTP module and in-memory data, so it can be hosted separately if required.
