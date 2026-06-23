"""
RouteNest backend — FastAPI implementation mirroring the Node/Express backend.
Provides identical endpoints so the React preview works in the Emergent env,
while the Express version (in /app/RouteNest_Vercel_Backend) is the Vercel deploy target.
"""
import os
import secrets
import time
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import socketio

fastapi_app = FastAPI(title="RouteNest API")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────── Socket.IO ──────────
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*", logger=False, engineio_logger=False)
# Map sid -> user_id (so we know which room to leave on disconnect)
sid_to_user: Dict[str, int] = {}


def _user_room(uid: int) -> str:
    return f"user:{uid}"


@sio.event
async def connect(sid, environ, auth):
    """Authenticate via token sent in auth.token; if invalid, anonymous connection is allowed
    but the client should call 'join' explicitly after login."""
    token = (auth or {}).get("token") if isinstance(auth, dict) else None
    if token and token in store["sessions"]:
        uid = store["sessions"][token]
        sid_to_user[sid] = uid
        await sio.enter_room(sid, _user_room(uid))


@sio.event
async def join(sid, data):
    """Manual room join after login."""
    token = (data or {}).get("token") if isinstance(data, dict) else None
    if not token or token not in store["sessions"]:
        return {"ok": False, "error": "invalid token"}
    uid = store["sessions"][token]
    # Leave any previous room
    prev = sid_to_user.get(sid)
    if prev and prev != uid:
        await sio.leave_room(sid, _user_room(prev))
    sid_to_user[sid] = uid
    await sio.enter_room(sid, _user_room(uid))
    return {"ok": True, "userId": uid}


@sio.event
async def leave(sid, data=None):
    """Manual room leave (on logout)."""
    uid = sid_to_user.pop(sid, None)
    if uid:
        await sio.leave_room(sid, _user_room(uid))
    return {"ok": True}


@sio.event
async def disconnect(sid):
    uid = sid_to_user.pop(sid, None)
    if uid:
        await sio.leave_room(sid, _user_room(uid))


async def _emit_notification(uid: int, notification: dict, unread_count: int):
    """Push a notification to the user's room + send fresh unread-count."""
    await sio.emit("notification:new", notification, room=_user_room(uid))
    await sio.emit("notification:unread-count", {"userId": uid, "unreadCount": unread_count}, room=_user_room(uid))


def _unread_count(uid: int) -> int:
    return sum(1 for n in store["notificationHistory"] if n["userId"] == uid and not n["read"])


# Public alias so other code paths can call this without importing the underscored helper
async def push_notification(uid: int, notification: dict):
    await _emit_notification(uid, notification, _unread_count(uid))


# ─── Demo notifications (idempotent — only seeded if user has none) ───
_DEMO_NOTIFICATIONS = [
    {"type": "booking",         "title": "Booking Confirmed ✓",
     "body":  "Your bus from Mumbai to Pune is confirmed. Booking ID: #BK00001. Departure: 10:30 PM"},
    {"type": "journeyReminder", "title": "Journey Reminder 🚌",
     "body":  "Your Mumbai → Pune bus departs in 45 minutes. Please proceed to Platform 3."},
    {"type": "scheduleChange",  "title": "Schedule Update ⚠️",
     "body":  "Your Delhi to Jaipur bus is delayed by 18 minutes due to traffic."},
    {"type": "cancellation",    "title": "Booking Cancelled",
     "body":  "Your booking #BK00089 (Pune → Goa) has been cancelled. Refund of ₹850 will be processed in 3-5 days."},
    {"type": "promotional",     "title": "🎉 30% Off This Weekend!",
     "body":  "Book any night bus this weekend and get 30% discount. Use code NIGHT30 at checkout."},
    {"type": "offers",          "title": "Flash Sale: Ends in 2 Hours ⚡",
     "body":  "Mumbai ↔ Pune express routes at just ₹199. Limited seats available — book now!"},
    {"type": "booking",         "title": "New Booking Confirmed ✓",
     "body":  "Bangalore to Chennai seat confirmed. Booking ID: #BK00102. Departure: 11:00 PM tonight."},
    {"type": "journeyReminder", "title": "Board in 15 Minutes 🚌",
     "body":  "Your Bangalore → Chennai bus leaves in 15 minutes. Driver: Suresh K. Bus: KA-01-F-2345."},
    {"type": "scheduleChange",  "title": "Route Change Notice",
     "body":  "Your Ahmedabad to Mumbai bus will now depart from Gate 7 instead of Gate 2. Sorry for inconvenience."},
    {"type": "offers",          "title": "You Earned a Reward! 🌟",
     "body":  "Congratulations! You've completed 5 journeys on RouteNest. You've earned 500 reward points."},
]


def _seed_demo_notifications_if_needed(uid: int) -> int:
    """Create the 10 demo notifications for a user if (and only if) they
    don't already have any in their history. Returns the count created."""
    existing = any(n["userId"] == uid for n in store["notificationHistory"])
    if existing:
        return 0
    base_ts = time.time()
    for i, demo in enumerate(_DEMO_NOTIFICATIONS):
        # Stagger sentAt by a few seconds (descending so #1 is the newest)
        sent_at = datetime.fromtimestamp(base_ts - i, tz=timezone.utc).isoformat()
        store["notificationHistory"].append({
            "id": _next_id(store["notificationHistory"]),
            "userId": uid,
            "type": demo["type"], "title": demo["title"], "body": demo["body"],
            "channels": ["push", "inApp"], "language": "en",
            "sentAt": sent_at, "read": False, "readAt": None, "metadata": {},
        })
    return len(_DEMO_NOTIFICATIONS)


# Replace `app` (the ASGI export uvicorn loads) with the combined Socket.IO app
# The path is mounted under /api/* so the Kubernetes ingress routes it to this service.
app = socketio.ASGIApp(sio, fastapi_app, socketio_path="api/socket.io")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ────────── In-memory store (matches store.js shape) ──────────
store: Dict[str, Any] = {
    "users": [],
    "sessions": {},
    "posts": [],
    "userProfiles": [],
    "reviews": [],
    "notificationHistory": [],
    "notificationQueue": [],
    "userNotificationPreferences": [],
    "deliveryLogs": [],
    "moderationQueue": [],
    "forums": [
        {"id": 1, "title": "Routes Discussion", "slug": "routes",
         "description": "Share and discuss bus routes across India", "icon": "road", "emoji": "🛣️",
         "topics": [
             {"id": 1, "title": "North India Routes", "slug": "north-india",
              "description": "Delhi, Punjab, HP, J&K bus routes", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 2, "title": "South India Routes", "slug": "south-india",
              "description": "Karnataka, TN, AP, Kerala routes", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 3, "title": "Overnight Sleeper Routes", "slug": "overnight",
              "description": "Best overnight sleeper bus journeys", "postsCount": 0, "lastActivityAt": _now()},
         ]},
        {"id": 2, "title": "Travel Tips & Advice", "slug": "travel-tips",
         "description": "Advice from experienced travelers", "icon": "tip", "emoji": "✈️",
         "topics": [
             {"id": 1, "title": "Safety on the Road", "slug": "safety",
              "description": "Stay safe while traveling by bus", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 2, "title": "Budget Travel Hacks", "slug": "budget",
              "description": "Get the most out of every rupee", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 3, "title": "Packing & Comfort", "slug": "packing",
              "description": "What to carry for a long bus ride", "postsCount": 0, "lastActivityAt": _now()},
         ]},
        {"id": 3, "title": "Destinations", "slug": "destinations",
         "description": "Hidden gems and popular spots", "icon": "map", "emoji": "🗺️",
         "topics": [
             {"id": 1, "title": "Coastal & Beaches", "slug": "beaches",
              "description": "Goa, Konkan, Andamans and beyond", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 2, "title": "Hill Stations", "slug": "hills",
              "description": "Himachal, Uttarakhand, North-East", "postsCount": 0, "lastActivityAt": _now()},
             {"id": 3, "title": "Cultural Heritage", "slug": "heritage",
              "description": "Forts, temples and old cities", "postsCount": 0, "lastActivityAt": _now()},
         ]},
    ],
    "socialShares": [],
    "userPreferences": {},
}


def _hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def _next_id(coll: List[dict]) -> int:
    return (max((x.get("id", 0) for x in coll), default=0) or 0) + 1


def _safe_user(u: dict) -> dict:
    return {k: v for k, v in u.items() if k != "password"}


def _auth_user(authorization: Optional[str]) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    uid = store["sessions"].get(token)
    if not uid:
        return None
    return next((u for u in store["users"] if u["id"] == uid), None)


# ───────── Health ─────────
@fastapi_app.get("/api/health")
async def health():
    return {"status": "ok", "uptime": int(time.time()), "timestamp": _now()}


# ───────── Auth ─────────
class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


@fastapi_app.post("/api/auth/register")
async def register(body: RegisterIn):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    email = body.email.strip().lower()
    if any(u["email"] == email for u in store["users"]):
        raise HTTPException(409, "Email already registered.")
    user = {
        "id": _next_id(store["users"]),
        "name": body.name.strip(),
        "email": email,
        "password": _hash_pw(body.password),
        "verified": True,
        "theme": None,
        "createdAt": _now(),
    }
    store["users"].append(user)
    # also create a profile
    store["userProfiles"].append({
        "id": _next_id(store["userProfiles"]),
        "userId": user["id"], "name": user["name"], "email": email,
        "verified": True, "verificationDate": _now(),
        "bio": "", "avatar": f"https://i.pravatar.cc/150?u={email}",
        "totalPosts": 0, "totalLikes": 0, "followersCount": 0,
        "joinedAt": _now(), "badges": ["verified"], "socialLinks": {},
    })
    # default notification prefs
    store["userNotificationPreferences"].append({
        "id": _next_id(store["userNotificationPreferences"]),
        "userId": user["id"], "email": email, "language": "en",
        "channels": {"email": True, "push": True, "sms": False},
        "notificationTypes": {"booking": True, "cancellation": True,
                              "scheduleChange": True, "journeyReminder": True,
                              "promotional": False, "offers": False},
        "timezone": "Asia/Kolkata", "quiet_hours_enabled": False,
        "quiet_hours_start": "22:00", "quiet_hours_end": "08:00",
        "createdAt": _now(), "updatedAt": _now(),
    })
    token = secrets.token_hex(24)
    store["sessions"][token] = user["id"]
    _seed_demo_notifications_if_needed(user["id"])
    return {"token": token, "user": _safe_user(user)}


@fastapi_app.post("/api/auth/login")
async def login(body: LoginIn):
    email = body.email.strip().lower()
    user = next((u for u in store["users"] if u["email"] == email), None)
    if not user or user["password"] != _hash_pw(body.password):
        raise HTTPException(401, "Invalid email or password.")
    token = secrets.token_hex(24)
    store["sessions"][token] = user["id"]
    _seed_demo_notifications_if_needed(user["id"])
    return {"token": token, "user": _safe_user(user)}


@fastapi_app.get("/api/auth/me")
async def me(authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    _seed_demo_notifications_if_needed(user["id"])
    return {"user": _safe_user(user)}


class ThemeIn(BaseModel):
    theme: str


class LanguageIn(BaseModel):
    language: str


@fastapi_app.put("/api/users/me/theme")
async def update_theme(body: ThemeIn, authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    if body.theme not in ("light", "dark"):
        raise HTTPException(400, "theme must be 'light' or 'dark'")
    user["theme"] = body.theme
    return {"theme": user["theme"]}


@fastapi_app.put("/api/users/me/language")
async def update_language(body: LanguageIn, authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    if body.language not in ("en", "hi", "es"):
        raise HTTPException(400, "language must be 'en', 'hi' or 'es'")
    user["language"] = body.language
    return {"language": user["language"]}


# ───────── Community ─────────
# Topics allowed for community posts
ALLOWED_TOPICS = {"routes", "destinations", "travel-tips"}


@fastapi_app.get("/api/community")
async def list_posts():
    items = [p for p in store["posts"] if not p.get("removed")]
    items.sort(key=lambda p: p["createdAt"], reverse=True)
    return items


@fastapi_app.get("/api/community/trending")
async def trending_posts():
    """Trending = most likes in the last 7 days."""
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    visible = [p for p in store["posts"] if not p.get("removed")]

    def recent_likes(p):
        return sum(1 for ts in p.get("likedAt", {}).values() if ts >= cutoff)

    # Sort by recent like count desc, then total likes, then newest
    visible.sort(
        key=lambda p: (recent_likes(p), len(p["likes"]), p["createdAt"]),
        reverse=True,
    )
    return [{**p, "recentLikes7d": recent_likes(p)} for p in visible[:10]]


@fastapi_app.get("/api/community/{pid}")
async def get_post(pid: int):
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    return p


def _normalize_topic(t: Any) -> str:
    if not t:
        return "travel-tips"
    s = str(t).strip().lower().replace(" ", "-")
    return s if s in ALLOWED_TOPICS else "travel-tips"


@fastapi_app.post("/api/community")
async def create_post(body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    # Requirement #5: Only users with isVerified must be true
    if not user or not (user.get("verified") or user.get("isVerified")):
        raise HTTPException(403, "Only verified users can post.")
    if not body.get("title") or not body.get("body"):
        raise HTTPException(400, "Missing required field: title/body")
    post = {
        "id": _next_id(store["posts"]),
        "authorId": user["id"], "author": user["name"], "verified": True,
        "topic": _normalize_topic(body.get("topic")),
        "title": body["title"].strip(), "body": body["body"].strip(),
        "photo": body.get("photo", "").strip(), "likes": [], "likedAt": {}, "comments": [],
        "reports": [], "shares": {"twitter": 0, "facebook": 0, "instagram": 0, "whatsapp": 0},
        "removed": False, "createdAt": _now(),
    }
    store["posts"].insert(0, post)
    return post


@fastapi_app.patch("/api/community/{pid}")
async def edit_post(pid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    if p["authorId"] != user["id"]:
        raise HTTPException(403, "You can only edit your own posts.")
    if "title" in body and body["title"]:
        p["title"] = str(body["title"]).strip()
    if "body" in body and body["body"]:
        p["body"] = str(body["body"]).strip()
    if "photo" in body:
        p["photo"] = str(body["photo"] or "").strip()
    if "topic" in body:
        p["topic"] = _normalize_topic(body["topic"])
    p["updatedAt"] = _now()
    return p


@fastapi_app.post("/api/community/{pid}/like")
async def like_post(pid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    """Toggle like: if user already liked, unlike; otherwise like."""
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    p.setdefault("likedAt", {})
    uid = user["id"]
    if uid in p["likes"]:
        p["likes"].remove(uid)
        p["likedAt"].pop(str(uid), None)
        liked = False
    else:
        p["likes"].append(uid)
        p["likedAt"][str(uid)] = _now()
        liked = True
    return {"id": p["id"], "likes": len(p["likes"]), "likedByUser": liked}


@fastapi_app.post("/api/community/{pid}/unlike")
async def unlike_post(pid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    """Explicit unlike (idempotent)."""
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    p.setdefault("likedAt", {})
    if user["id"] in p["likes"]:
        p["likes"].remove(user["id"])
        p["likedAt"].pop(str(user["id"]), None)
    return {"id": p["id"], "likes": len(p["likes"]), "likedByUser": False}


@fastapi_app.post("/api/community/{pid}/comment")
async def comment(pid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user or not user.get("verified"):
        raise HTTPException(403, "Only verified users can comment.")
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    text = (body.get("text") or "").strip()
    if not text:
        raise HTTPException(400, "Comment text is required.")
    c = {
        "id": _next_id(p["comments"]) if p["comments"] else 1,
        "authorId": user["id"], "author": user["name"], "verified": True,
        "text": text, "likes": 0, "replies": [],
        "parentId": body.get("parentId"),
        "timestamp": _now(),
    }
    if body.get("parentId"):
        parent = next((c0 for c0 in p["comments"] if c0["id"] == body["parentId"]), None)
        if parent is not None:
            parent.setdefault("replies", []).append(c)
            return c
    p["comments"].append(c)
    # in-app notification to author
    if p["authorId"] != user["id"]:
        n_obj = {
            "id": _next_id(store["notificationHistory"]),
            "userId": p["authorId"], "type": "comment",
            "title": "New Comment", "body": f'{user["name"]} commented on your post',
            "channels": ["inApp"], "language": "en",
            "sentAt": _now(), "read": False, "readAt": None, "metadata": {"postId": p["id"]},
        }
        store["notificationHistory"].append(n_obj)
        await push_notification(p["authorId"], n_obj)
    return c


@fastapi_app.post("/api/community/{pid}/report")
async def report(pid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    reason = body.get("reason")
    if not reason:
        raise HTTPException(400, "Report reason is required.")
    r = {"id": _next_id(store["moderationQueue"]), "postId": p["id"],
         "reportedBy": user["id"], "reason": reason,
         "description": body.get("description", ""),
         "reportedAt": _now(), "status": "pending",
         "reviewedBy": None, "action": None}
    p["reports"].append(r)
    store["moderationQueue"].append(r)
    return {"id": p["id"], "reportCount": len(p["reports"]), "status": "reported"}


@fastapi_app.post("/api/community/{pid}/share")
async def share(pid: int, body: Dict[str, Any]):
    p = next((x for x in store["posts"] if x["id"] == pid and not x.get("removed")), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    platform = body.get("platform")
    if platform not in ["twitter", "facebook", "instagram", "whatsapp"]:
        raise HTTPException(400, "Valid platform required.")
    p["shares"][platform] += 1
    return {"id": p["id"], "shares": p["shares"], "message": f"Shared on {platform}"}


@fastapi_app.delete("/api/community/{pid}")
async def delete_post(pid: int, authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized")
    p = next((x for x in store["posts"] if x["id"] == pid), None)
    if not p:
        raise HTTPException(404, "Post not found.")
    if p["authorId"] != user["id"]:
        raise HTTPException(403, "You can only delete your own posts.")
    p["removed"] = True
    return {"message": "Post removed successfully."}


# ───────── Forums ─────────
@fastapi_app.get("/api/forums")
async def forums():
    return [{**f, "topicCount": len(f["topics"])} for f in store["forums"]]


@fastapi_app.get("/api/forums/{slug}")
async def forum(slug: str):
    f = next((x for x in store["forums"] if x["slug"] == slug), None)
    if not f:
        raise HTTPException(404, "Forum not found.")
    return f


# ───────── Profiles ─────────
@fastapi_app.get("/api/profiles")
async def profiles():
    return [p for p in store["userProfiles"] if p.get("verified")]


@fastapi_app.get("/api/profiles/{uid}")
async def profile(uid: int):
    p = next((x for x in store["userProfiles"] if x["userId"] == uid), None)
    if not p:
        raise HTTPException(404, "User profile not found.")
    user_posts = sorted(
        [post for post in store["posts"] if post["authorId"] == uid and not post.get("removed")],
        key=lambda x: x["createdAt"], reverse=True
    )
    user = _user_by_id(uid)
    return {**p,
            "trustedReviewer": bool(user and user.get("trustedReviewer")),
            "recentPosts": user_posts[:5], "postCount": len(user_posts),
            "engagementStats": {
                "totalPostLikes": sum(len(x["likes"]) for x in user_posts),
                "totalComments": sum(len(x["comments"]) for x in user_posts),
                "totalReports": sum(len(x["reports"]) for x in user_posts),
            }}


# ───────── Reviews ─────────
TRUSTED_THRESHOLD = 5


def _user_by_id(uid: Optional[int]):
    if uid is None:
        return None
    return next((u for u in store["users"] if u["id"] == uid), None)


def _user_by_name(name: str):
    n = (name or "").strip().lower()
    return next((u for u in store["users"] if u["name"].lower() == n), None)


def _enrich_review(r: dict) -> dict:
    """Attach reviewer's trustedReviewer flag for the frontend."""
    author = _user_by_id(r.get("userId")) or _user_by_name(r.get("user", ""))
    return {**r, "trustedReviewer": bool(author and author.get("trustedReviewer"))}


def _recompute_trusted_for(uid: int):
    """Sum a user's helpful votes across all their visible reviews.
    If total ≥ TRUSTED_THRESHOLD, mark trustedReviewer=True on the user.
    Returns the new total and the trusted flag."""
    user = _user_by_id(uid)
    if not user:
        return 0, False
    total = sum(
        r.get("helpful", 0)
        for r in store["reviews"]
        if not r.get("hidden")
        and ((r.get("userId") == uid) or (r.get("user", "").lower() == user["name"].lower()))
    )
    if total >= TRUSTED_THRESHOLD:
        user["trustedReviewer"] = True
    return total, bool(user.get("trustedReviewer"))


@fastapi_app.get("/api/reviews")
async def reviews(userId: Optional[int] = None):
    items = [r for r in store["reviews"] if not r.get("hidden")]
    if userId is not None:
        u = _user_by_id(userId)
        uname = u["name"].lower() if u else ""
        items = [r for r in items
                 if r.get("userId") == userId
                 or (uname and r.get("user", "").lower() == uname)]
    return [_enrich_review(r) for r in items]


@fastapi_app.get("/api/reviews/stats")
async def reviews_stats():
    visible = [r for r in store["reviews"] if not r.get("hidden")]
    avg = (sum(r["rating"] for r in visible) / len(visible)) if visible else 0
    return {
        "total": len(visible),
        "averageRating": round(avg * 10) / 10,
        "fiveStars": sum(1 for r in visible if r["rating"] == 5),
        "fourStars": sum(1 for r in visible if r["rating"] == 4),
        "threeStars": sum(1 for r in visible if r["rating"] == 3),
        "twoStars": sum(1 for r in visible if r["rating"] == 2),
        "oneStar": sum(1 for r in visible if r["rating"] == 1),
    }


@fastapi_app.post("/api/reviews")
async def create_review(body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user or not user.get("verified"):
        raise HTTPException(403, "Only verified users can submit reviews.")
    if not body.get("completedJourney"):
        raise HTTPException(403, "Reviews are allowed only after a completed journey.")
    for f in ["route", "rating", "text", "journeyId"]:
        if not body.get(f):
            raise HTTPException(400, f"Missing required field: {f}")
    rating = int(body["rating"])
    if rating < 1 or rating > 5:
        raise HTTPException(400, "Rating must be 1-5.")
    text = body["text"].strip()
    if len(text) < 30:
        raise HTTPException(400, "Review must be at least 30 characters.")
    dup = next((r for r in store["reviews"]
                if r["user"].lower() == user["name"].lower()
                and r["route"].lower() == body["route"].lower()
                and str(r.get("journeyId", "")).lower() == str(body["journeyId"]).lower()
                and not r.get("hidden")), None)
    if dup:
        raise HTTPException(409, "You already reviewed this route for this journey.")
    review = {
        "id": _next_id(store["reviews"]),
        "route": body["route"].strip(), "journeyId": str(body["journeyId"]).strip(),
        "user": user["name"], "userId": user["id"], "verified": True,
        "completedJourney": True, "rating": rating, "text": text,
        "helpful": 0, "helpfulBy": [], "reports": 0,
        "hidden": False, "createdAt": _now(),
    }
    store["reviews"].append(review)
    return review


@fastapi_app.patch("/api/reviews/{rid}")
async def edit_review(rid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized.")
    r = next((x for x in store["reviews"] if x["id"] == rid and not x.get("hidden")), None)
    if not r:
        raise HTTPException(404, "Review not found.")
    if r.get("userId") != user["id"] and r["user"].lower() != user["name"].lower():
        raise HTTPException(403, "You can only edit your own reviews.")
    age_ms = (datetime.now(timezone.utc) - datetime.fromisoformat(r["createdAt"])).total_seconds() * 1000
    if age_ms > 24 * 60 * 60 * 1000:
        raise HTTPException(403, "The 24-hour edit window has expired.")
    text = (body.get("text") or "").strip()
    if len(text) < 30:
        raise HTTPException(400, "Review must be at least 30 characters.")
    r["text"] = text
    r["updatedAt"] = _now()
    return r


@fastapi_app.post("/api/reviews/{rid}/helpful")
async def helpful(rid: int, body: Dict[str, Any], authorization: Optional[str] = Header(None)):
    user = _auth_user(authorization)
    if not user:
        raise HTTPException(401, "Unauthorized.")
    r = next((x for x in store["reviews"] if x["id"] == rid and not x.get("hidden")), None)
    if not r:
        raise HTTPException(404, "Review not found.")
    r.setdefault("helpfulBy", [])
    if user["id"] in r["helpfulBy"]:
        r["helpfulBy"].remove(user["id"])
        r["helpful"] = max(0, r["helpful"] - 1)
    else:
        r["helpfulBy"].append(user["id"])
        r["helpful"] += 1

    # Recompute trusted reviewer status for the review's author
    author = _user_by_id(r.get("userId")) or _user_by_name(r.get("user", ""))
    total_helpful = 0
    trusted = False
    if author:
        total_helpful, trusted = _recompute_trusted_for(author["id"])

    return {
        "id": r["id"],
        "helpful": r["helpful"],
        "voted": user["id"] in r["helpfulBy"],
        "authorTotalHelpful": total_helpful,
        "authorTrustedReviewer": trusted,
    }


@fastapi_app.post("/api/reviews/{rid}/report")
async def report_review(rid: int, body: Dict[str, Any]):
    r = next((x for x in store["reviews"] if x["id"] == rid and not x.get("hidden")), None)
    if not r:
        raise HTTPException(404, "Review not found.")
    r["reports"] += 1
    if r["reports"] >= 3:
        r["hidden"] = True
    return {"id": r["id"], "reports": r["reports"], "hidden": r["hidden"]}


# ───────── Notifications ─────────
@fastapi_app.get("/api/notifications/preferences/{uid}")
async def get_prefs(uid: int):
    p = next((x for x in store["userNotificationPreferences"] if x["userId"] == uid), None)
    if not p:
        raise HTTPException(404, "Preferences not found")
    return p


@fastapi_app.put("/api/notifications/preferences/{uid}")
async def put_prefs(uid: int, body: Dict[str, Any]):
    p = next((x for x in store["userNotificationPreferences"] if x["userId"] == uid), None)
    if not p:
        raise HTTPException(404, "Preferences not found")
    for k, v in body.items():
        if k not in ("id", "userId"):
            p[k] = v
    p["updatedAt"] = _now()
    return {"message": "Preferences updated successfully", "preferences": p}


@fastapi_app.get("/api/notifications/history/{uid}")
async def history(uid: int, limit: int = 50, offset: int = 0,
                  type: Optional[str] = None, unread: Optional[str] = None):
    items = [n for n in store["notificationHistory"] if n["userId"] == uid]
    if type:
        items = [n for n in items if n["type"] == type]
    if unread == "true":
        items = [n for n in items if not n["read"]]
    items.sort(key=lambda x: x["sentAt"], reverse=True)
    return {"total": len(items), "count": len(items[offset:offset+limit]),
            "limit": limit, "offset": offset,
            "notifications": items[offset:offset+limit]}


@fastapi_app.get("/api/notifications/unread-count/{uid}")
async def unread_count(uid: int):
    c = sum(1 for n in store["notificationHistory"] if n["userId"] == uid and not n["read"])
    return {"userId": uid, "unreadCount": c}


@fastapi_app.post("/api/notifications/mark-read")
async def mark_read(body: Dict[str, Any]):
    uid = body.get("userId")
    ids = body.get("notificationIds", [])
    n = 0
    for nid in ids:
        item = next((x for x in store["notificationHistory"]
                     if x["id"] == nid and x["userId"] == uid and not x["read"]), None)
        if item:
            item["read"] = True
            item["readAt"] = _now()
            n += 1
    if uid is not None:
        await sio.emit("notification:unread-count", {"userId": uid, "unreadCount": _unread_count(uid)}, room=_user_room(uid))
    return {"message": f"{n} notification(s) marked as read", "markedCount": n}


@fastapi_app.post("/api/notifications/mark-all-read")
async def mark_all_read(body: Dict[str, Any]):
    uid = body.get("userId")
    n = 0
    for x in store["notificationHistory"]:
        if x["userId"] == uid and not x["read"]:
            x["read"] = True
            x["readAt"] = _now()
            n += 1
    if uid is not None:
        await sio.emit("notification:unread-count", {"userId": uid, "unreadCount": _unread_count(uid)}, room=_user_room(uid))
    return {"message": f"{n} notification(s) marked as read", "markedCount": n}


@fastapi_app.post("/api/notifications/send")
async def send_notif(body: Dict[str, Any]):
    for f in ["userId", "type", "title", "body"]:
        if not body.get(f):
            raise HTTPException(400, f"Missing field: {f}")
    n = {
        "id": _next_id(store["notificationHistory"]),
        "userId": int(body["userId"]), "type": body["type"],
        "title": body["title"], "body": body["body"],
        "channels": body.get("channels", ["push"]),
        "language": body.get("language", "en"),
        "sentAt": _now(), "read": False, "readAt": None,
        "metadata": body.get("metadata", {}),
    }
    store["notificationHistory"].append(n)
    for ch in n["channels"]:
        store["deliveryLogs"].append({
            "id": _next_id(store["deliveryLogs"]), "notificationId": n["id"],
            "userId": n["userId"], "channel": ch, "status": "delivered",
            "sentAt": _now(), "deliveredAt": _now(),
            "failureReason": None, "retryCount": 0,
        })
    await push_notification(n["userId"], n)
    return {"message": "Notification sent successfully", "notification": n,
            "channelsSent": n["channels"]}


@fastapi_app.post("/api/notifications/retry")
async def retry_notif(body: Dict[str, Any]):
    nid = body.get("notificationId")
    uid = body.get("userId")
    logs = [l for l in store["deliveryLogs"]
            if l["notificationId"] == nid and l["userId"] == uid and l["status"] == "failed"]
    if not logs:
        raise HTTPException(404, "No failed deliveries.")
    n = 0
    for l in logs:
        if l["retryCount"] < 3:
            l["status"] = "retrying"
            l["retryCount"] += 1
            l["lastRetryAt"] = _now()
            n += 1
    return {"message": f"{n} delivery(ies) marked for retry", "retriedCount": n}


@fastapi_app.get("/api/notifications/stats/{uid}")
async def notif_stats(uid: int):
    items = [n for n in store["notificationHistory"] if n["userId"] == uid]
    by_type: Dict[str, int] = {}
    by_channel: Dict[str, int] = {}
    for n in items:
        by_type[n["type"]] = by_type.get(n["type"], 0) + 1
        for c in n["channels"]:
            by_channel[c] = by_channel.get(c, 0) + 1
    return {"total": len(items), "unread": sum(1 for n in items if not n["read"]),
            "read": sum(1 for n in items if n["read"]),
            "byType": by_type, "byChannel": by_channel}


# ───────── Planner (OSRM passthrough) ─────────
NOMINATIM = "https://nominatim.openstreetmap.org/search"
OSRM = "https://router.project-osrm.org/route/v1/driving"


async def _geocode(city: str) -> List[float]:
    async with httpx.AsyncClient(timeout=15.0) as cli:
        r = await cli.get(NOMINATIM, params={"format": "json", "limit": 1, "q": city},
                          headers={"User-Agent": "RouteNest/1.0"})
        r.raise_for_status()
        data = r.json()
        if not data:
            raise HTTPException(400, f"Location not found: {city}")
        return [float(data[0]["lon"]), float(data[0]["lat"])]


def _classify_traffic(delay: int) -> Dict[str, str]:
    if delay <= 8:
        return {"congestion": "18%", "impact": "Low traffic"}
    if delay <= 22:
        return {"congestion": "36%", "impact": "Moderate traffic"}
    return {"congestion": "58%", "impact": "Heavy traffic"}


@fastapi_app.post("/api/planner/plan")
async def plan(body: Dict[str, Any]):
    start = (body.get("start") or "").strip()
    destination = (body.get("destination") or "").strip()
    if not start or not destination:
        raise HTTPException(400, "Missing required field: start/destination")
    waypoints = [w.strip() for w in (body.get("waypoints") or []) if w and w.strip()][:3]
    try:
        pts = [await _geocode(start)]
        for w in waypoints:
            pts.append(await _geocode(w))
        pts.append(await _geocode(destination))
        coord_str = ";".join(f"{lon},{lat}" for lon, lat in pts)
        async with httpx.AsyncClient(timeout=20.0) as cli:
            r = await cli.get(f"{OSRM}/{coord_str}",
                              params={"overview": "full", "geometries": "geojson",
                                      "alternatives": "true", "steps": "false"})
            r.raise_for_status()
            j = r.json()
        if j.get("code") != "Ok" or not j.get("routes"):
            raise HTTPException(400, "No route found.")
        routes = j["routes"][:3]
        # Build payloads first (with congestion percentage)
        payloads = []
        for i, route in enumerate(routes):
            dist_km = max(1, round((route.get("distance") or 0) / 1000))
            eta = max(1, round((route.get("duration") or 0) / 60))
            delay = max(4, round(eta * (0.06 + i * 0.07)))
            tf = _classify_traffic(delay)
            congestion_pct = int(str(tf["congestion"]).rstrip("%") or 0)
            coords = (route.get("geometry") or {}).get("coordinates", [])
            payloads.append({
                "id": f"osrm-{i}-{int(time.time()*1000)}",
                "name": ["Fastest Route", "Alternate Route", "Scenic Route"][i] if i < 3 else f"Route {i+1}",
                "distanceKm": dist_km, "etaMinutes": eta,
                "congestion": tf["congestion"],
                "congestionPct": congestion_pct,
                "delayMinutes": delay,
                "trafficImpact": tf["impact"],
                "highTraffic": congestion_pct > 30,
                "path": [[c[1], c[0]] for c in coords],
            })

        # Recommendation = lowest congestion (ties broken by lowest ETA)
        recommended_idx = min(
            range(len(payloads)),
            key=lambda i: (payloads[i]["congestionPct"], payloads[i]["etaMinutes"]),
        )
        for i, p in enumerate(payloads):
            p["recommended"] = (i == recommended_idx)

        return {"source": "vendor", "provider": "osrm", "routes": payloads}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Unable to build route: {str(e)[:120]}")


# saved routes per user
@fastapi_app.get("/api/planner/saved/{uid}")
async def saved_routes(uid: int):
    return store["userPreferences"].get(f"routes_{uid}", [])


@fastapi_app.post("/api/planner/saved/{uid}")
async def save_route(uid: int, body: Dict[str, Any]):
    key = f"routes_{uid}"
    routes = store["userPreferences"].get(key, [])
    item = {**body, "id": _next_id(routes), "savedAt": _now()}
    routes.append(item)
    store["userPreferences"][key] = routes
    return item


@fastapi_app.delete("/api/planner/saved/{uid}/{rid}")
async def delete_saved(uid: int, rid: int):
    key = f"routes_{uid}"
    routes = store["userPreferences"].get(key, [])
    store["userPreferences"][key] = [r for r in routes if r["id"] != rid]
    return {"message": "Deleted"}


# ───────── Seed default verified users for testing ─────────
@fastapi_app.on_event("startup")
async def seed():
    if not store["users"]:
        for name, em in [("Aarav Mehta", "aarav@example.com"), ("Maya Shah", "maya@example.com")]:
            store["users"].append({
                "id": _next_id(store["users"]), "name": name, "email": em,
                "password": _hash_pw("password123"), "verified": True,
                "theme": None, "createdAt": _now(),
            })
            uid = store["users"][-1]["id"]
            store["userProfiles"].append({
                "id": _next_id(store["userProfiles"]), "userId": uid,
                "name": name, "email": em, "verified": True,
                "verificationDate": _now(), "bio": f"Travel enthusiast",
                "avatar": f"https://i.pravatar.cc/150?u={em}",
                "totalPosts": 0, "totalLikes": 0, "followersCount": 0,
                "joinedAt": _now(), "badges": ["verified"], "socialLinks": {},
            })
            store["userNotificationPreferences"].append({
                "id": _next_id(store["userNotificationPreferences"]),
                "userId": uid, "email": em, "language": "en",
                "channels": {"email": True, "push": True, "sms": False},
                "notificationTypes": {"booking": True, "cancellation": True,
                                      "scheduleChange": True, "journeyReminder": True,
                                      "promotional": False, "offers": False},
                "timezone": "Asia/Kolkata", "quiet_hours_enabled": False,
                "quiet_hours_start": "22:00", "quiet_hours_end": "08:00",
                "createdAt": _now(), "updatedAt": _now(),
            })
