<!-- ```markdown
# 📣 Classynk Web Push Notification System — Implementation Guide for KIRO

## 🧠 Overview

This feature introduces **Web Push Notifications** into Classynk, enabling time-sensitive updates for both lecturers and students regarding lectures and class activity — **without email fallback** or in-app notifications. It is fully powered by the **Vite-PWA Plugin**, **Convex Backend**, and **dynamic Crons** to ensure scheduling is runtime-driven.

## 🔔 Core Notification Use Cases

The following events will trigger a push notification:

1. **Lecture Reminder for Lecturer (30 mins before class)**
   - Sent based on course schedule
   - Configurable lead time in Lecturer Settings (min: 10 mins, max: 1 hour)

2. **Lecture Confirmation Response → Students**
   - If lecturer confirms class: Notify students that the class will hold
   - If lecturer cancels: Notify students that class is cancelled
   - If lecturer ignores: Behavior depends on lecturer’s setting:
     - "Default to Hold"
     - "Default to Unsure"

3. **Lecture Cancelled Manually by Lecturer**
   - Immediate push notification to students

## 🛠️ Tech Stack & Tools

- **Frontend**: React + TanStack Router + Vite
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Push Protocol**: Web Push API using VAPID keys
- **Backend**: Convex + Convex Crons (Dynamic)
- **No Email Fallback**, no in-app notification

---

## 🧩 Key Functional Components

### 1. 📅 Course Scheduling (Lecturer)

- Lecturers define the **days**, **start time**, and **end time** for a course.
- System **registers a dynamic Cron** in Convex per schedule entry.
- Cron is removed if the lecturer deletes the schedule.

### 2. ⏰ Pre-Class Cron Trigger (Convex)

- Triggers at course start time - `notification lead time` (default: 30 mins)
- Checks if today matches a valid scheduled day.
- This cron:
  - Sends a push notification to the lecturer asking:
    **“Will class for [Course Code] hold today at [time]?”**
  - Starts a 15-minute response window (or up to class time).

### 3. 👨‍🏫 Lecturer Response Handling

- If response = ✅ "Yes":
  - Notify all students: “Class will hold today at [time].”
- If response = ❌ "No":
  - Notify all students: “Class has been cancelled.”
- If ⏳ No response:
  - Look at lecturer setting:
    - **Default to Hold** → Send “Class will hold.”
    - **Default to Unsure** → Send “Class status is unsure.”

### 4. ⚙️ Notification Opt-In

- A toggle button in **Settings → Notifications**:
  - `Enable Notifications` → Requests browser permission + stores push subscription
  - `Disable Notifications` → Removes push subscription from DB

---

## 📦 Push Subscription Management

### Per Device, Per Browser

- A **push subscription object is unique per browser + device**.
- Chrome, Firefox, and browser profiles will each generate separate push objects.
- We must store multiple subscriptions per user in the DB.

### Expiry and Updates

- Subscription objects may become stale due to:
  - OS/browser updates
  - Permission revocation
- Implement periodic check:
  - When sending fails, **remove subscription** from DB.
  - Allow `re-subscribe` via UI.

---

## 🧠 Gotchas & Design Pitfalls

### 🔄 Subscription Object Staleness

- Subscriptions can silently expire. Handle send failures gracefully.
- Use `pushManager.getSubscription()` to detect invalid state.
- Offer users a “Re-subscribe” button if not found.

### 🧭 Tab Open vs Closed Behavior

- If a user’s tab is open, the push still shows via system notification tray.
- But in **some Android Chrome cases**, notifications may be suppressed or delayed if PWA isn’t installed. Encourage users to **Install the PWA** for reliability.

### 🔕 Notification Fatigue

- Avoid spamming students with too many alerts.
- No need to notify students for:
  - Attendance session start
  - Attendance window opening/closing
- These happen too frequently and are user-hostile.

### 🧪 Permissions

- Push only works on HTTPS domains
- Ensure permissions are requested **after user intent**, not on page load
- Respect denial: Do not loop permission requests

### 🧹 Cron Cleanup

- When course schedules are deleted or updated, ensure stale crons are also removed.
- Use `crons.remove()` as per [Convex Cron API](https://www.convex.dev/components/crons)

---

## ✅ Summary Flow

1. **Lecturer sets schedule**
   → Convex cron registered
2. **X minutes before class**
   → Cron triggers, asks lecturer for confirmation
3. **Lecturer responds**
   → Students notified (class will hold / cancelled)
4. **Lecturer ignores**
   → System follows fallback logic in settings
5. **Student experience**
   → All communication via Web Push
   → No need to open tab
   → Opt-in required in settings

---

## 📌 Future Improvements

- Allow students to customize which notifications they want to receive.
- Show past notification logs in a notification center (optional).
- Integrate with offline fallback (e.g., SMS) for institutional plans.
```

---

Let me know if you’d like this broken into multiple files (e.g. `cron.md`, `web-push.md`, `settings.md`) or plugged directly into a build system or doc site. -->

---

````markdown
# 📣 Web Push Notification System – Classynk Spec (for KIRO)

## ✅ Overview

This document outlines the implementation strategy, technical breakdown, and edge cases for integrating **Web Push Notifications** in Classynk. The goal is to deliver timely, reliable, and user-configurable notifications to both **lecturers** and **students** about upcoming lectures and class status, using modern web push APIs with `vite-plugin-pwa`, Convex functions, and cron scheduling.

> ⚠️ Only **Web Push** is used. No email or in-app notification fallback will be implemented.

---

## 🧠 Core Goals

- Notify lecturers about upcoming lectures for confirmation.
- Notify students based on lecturer responses.
- Support scheduled (cron-based) notifications.
- Provide control over notification preferences.
- Ensure reliable delivery across browser sessions and devices.
- Build a system that degrades gracefully and is aware of edge cases.

---

## 🔔 Notification Scenarios

Here are all the events where a push notification must be triggered:

### 👨‍🏫 Lecturer-Focused

1. **Lecture Reminder (30 mins before class)**
   - Triggered via a Convex Cron job based on class schedule.
   - Lecturer receives a push notification asking if the lecture will hold.
   - Time buffer (e.g., 10 mins – 1 hour) is configurable in lecturer settings.

2. **Class Schedule Created/Updated**
   - (Optional) Lecturer gets notified when a class schedule is set or updated.

---

### 🎓 Student-Focused

3. **Lecture Confirmed by Lecturer**
   - Students in the attendance list get a push notification: _"Lecture for CSC 301 will hold at 9:00 AM today."_

4. **Lecture Cancelled by Lecturer**
   - Notification: _"Your CSC 301 lecture has been cancelled by the lecturer."_

5. **Lecture Status is Unsure (No Lecturer Response)**
   - Message depends on lecturer's default setting:
     - A. _"No confirmation from your lecturer yet. Assume class is holding."_
     - B. _"Class status unclear. Please confirm with your lecturer."_

6. **Course Removed from Student**
   - (Optional) Notify student they’ve been removed from a course.

7. **Student Approved to Join Course**
   - (Optional) Notify student that they’ve been accepted into a course by the lecturer.

---

## 🔄 Dynamic Scheduling with Convex Crons

When a lecturer creates or updates a schedule:

1. A new **Convex Cron job** is registered dynamically with the class start time minus notification buffer (default 30 mins).
2. This cron will trigger the `reminder` function for the lecturer.
3. If a schedule is removed, the corresponding cron is **deleted** via Convex logic.

> 💡 Use the [Convex Crons Component](https://www.convex.dev/components/crons) to register/unregister at runtime.

---

## ⚙️ User Controls

### 📍 Notification Preferences (Settings UI)

Each **student** and **lecturer** should have access to toggle:

| Option                                      | User      | Default | Notes                     |
| ------------------------------------------- | --------- | ------- | ------------------------- |
| Enable Web Push Notifications               | Both      | OFF     | Explicit opt-in required  |
| Notify me of lecture confirmations          | Students  | ON      | Can be disabled           |
| Notify me when class is cancelled           | Students  | ON      | Can be disabled           |
| Send 'class unsure' if no lecturer response | Students  | ON      | Can be disabled           |
| Default response if I don’t confirm class   | Lecturers | "Hold"  | Can be "Hold" or "Unsure" |
| Lead time before class for notification     | Lecturers | 30 mins | Range: 10 mins – 1 hour   |

> All settings must persist in Convex DB under the user document and be reactive.

---

## 🧠 Web Push Architecture (High Level)

### 1. Subscription Lifecycle

- Request notification permission when user enables toggle in Settings.
- Register Service Worker using `vite-plugin-pwa`.
- Store `PushSubscription` object in Convex DB keyed by user ID + device/browser fingerprint.
- Re-register if:
  - User clears site data.
  - Subscription expires or changes (detected via `pushsubscriptionchange` event).
  - User logs in on another browser.

### 2. Sending Notifications

- Use Convex Actions/Functions to send push messages via the stored `PushSubscription` object.
- Server payload should include:
  ```ts
  {
    title: "Lecture Reminder",
    body: "Do you want to confirm the CSC 301 class at 9:00 AM today?",
    icon: "/icons/icon-192x192.png",
    data: {
      type: "lecture-confirmation",
      courseId: "abc123"
    }
  }
  ```
````

- Handle logic for `confirm`, `cancel`, and `ignore` in a service worker or React UI, based on interaction.

---

## 🧱 System Design Best Practices & Gotchas

### ✅ Must Handle:

- ✅ **PushSubscription changes**: Browsers may rotate subscription objects. Detect and replace stored values.
- ✅ **Permission denied**: If a user denies permission, provide UI to retry later.
- ✅ **Multiple devices/browsers**: Store a list of `PushSubscription` objects per user and broadcast to all.
- ✅ **Foreground tab**: If tab is open, do not show notification as popup — use toast/snackbar instead.
- ✅ **Offline state**: Queue cron job payloads in Convex if users are offline, allow retries.
- ✅ **Unsubscribed users**: Skip sending push for those who haven’t opted in.

---

## 🔬 Extras for Robust UX

- 🌐 Show current browser’s push status (enabled, blocked, unsubscribed).
- 📲 Provide test notification button in Settings after opt-in.
- 🗂 Log notification delivery status for debugging or auditing.
- 🧪 Add localStorage flag to throttle notification retries if failure occurs.
- 🎨 Use subtle animations in the toast/snackbar when notifications display inside active tab.
- 🧼 Auto-clean up stale `PushSubscription` entries from Convex if pings fail repeatedly.

---

## ✅ Sample UX Flow – Lecturer Confirmation

1. Lecturer sets lecture for CSC 301 at 9:00 AM every Tuesday.
2. At 8:30 AM (30 mins before), Convex cron sends a push to the lecturer:

   > "Will your CSC 301 class hold today at 9:00 AM?"

3. Lecturer taps “Yes” → students receive:

   > "CSC 301 lecture is holding at 9:00 AM. Don’t miss it!"

4. Lecturer taps “No” → students receive:

   > "CSC 301 lecture has been cancelled by your lecturer."

5. Lecturer does not respond → system checks setting:
   - If default is “Hold” → students get “Lecture will hold”.
   - If default is “Unsure” → students get “Class status is unclear.”

---

## 🛠️ Dependencies

- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/)
- Convex backend
- Web Push API
- Service Workers
- IndexedDB/localStorage (for fallback/flags)

---

## 📌 Final Notes

- Avoid overwhelming users with irrelevant pings.
- Always **require user opt-in** via a visible toggle.
- Update subscription and user preferences reactively.
- Focus on real-time reliability + graceful failure handling.

---

```

Let me know if you want this adapted for a mobile-only experience or broken into modules for each KIRO Agent.
```
