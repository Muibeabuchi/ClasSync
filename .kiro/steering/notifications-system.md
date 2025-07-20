# 📣 ClassyNk Notifications Guide

This document outlines the behavior, purpose, and structure of the notifications system in the ClassyNk application. It is intended to guide implementation across the backend and frontend, ensuring consistent, predictable behavior.

---

## 🔔 Overview

Notifications in ClassyNk are designed to keep users (primarily students and lecturers) informed in real-time about key events and actions within the app. The system relies entirely on Convex’s real-time database capabilities to push updates to the frontend — there is no polling, email, or web-push delivery at this stage.

Notifications are strictly **in-app**, persistent, and must be manually marked as read. They are **not dismissible**, **not temporary**, and **do not expire** automatically.

---

## 🧩 Notification Use Cases

The following events currently generate notifications:

### 1. Student Requests to Join Course

- **Recipient:** Lecturer
- **Description:** When a student requests to join a course using the course code, the lecturer is notified of the incoming request, with relevant details attached.
- **Purpose:** Prompt lecturer review and approval.

### 2. Student Request is Approved or Rejected

- **Recipient:** Student
- **Description:** Once a lecturer takes action on a student’s request (approval or rejection), the student receives a notification reflecting the outcome.
- **Purpose:** Inform student of their admission status to the course.

### 3. Attendance Session Starts

- **Recipient:** All approved students in the course
- **Description:** When a lecturer initiates a new attendance session, enrolled students receive a notification indicating the session has begun.
- **Purpose:** Alert students to take attendance during the designated session window.

### 4. Subscription or Plan Updates

- **Recipient:** Lecturer
- **Description:** When a lecturer’s subscription plan changes (e.g., upgraded, downgraded, expired), a notification is sent reflecting this change.
- **Purpose:** Keep lecturers aware of their current plan status.

---

## 🔄 Notification Behavior and UI

### Visibility

- Users can view notifications via:
  - A **notification bell icon** in the top navigation bar
  - A **dedicated notifications page** listing all past alerts

### Unread Indicators

- Unread notifications are visually distinct.
- An unread count appears on the notification bell until all are marked as read.

### Read/Manage

- Users can:
  - Mark individual notifications as read
  - Mark all as read
- Notifications persist unless manually marked.

### Deep Linking

- Some notifications include internal links that direct users to a relevant area of the app (e.g., course page, approval request view, session page).

---

## 🧭 Notification Flow Summary

| Event                       | Initiator        | Receiver | Purpose                    |
| --------------------------- | ---------------- | -------- | -------------------------- |
| Student requests to join    | Student          | Lecturer | Approval needed            |
| Request approved/rejected   | Lecturer         | Student  | Admission status           |
| Attendance session begins   | Lecturer         | Students | Prompt attendance check-in |
| Subscription status changes | Paystack/Webhook | Lecturer | Plan awareness             |

---

## ⚙️ Sync & Delivery

- Notifications are delivered using **Convex real-time sync**.
- No polling, no web-push, and no email delivery involved.
- The frontend automatically reflects new notifications in real time via live queries or subscriptions.

---

## 🚫 Not Included in Notification System

The following are **intentionally excluded** from the notification system at this stage:

- Messaging or broadcast communication from lecturers
- Manual attendance override confirmations
- Admin or institution-wide system alerts
- Automatic expiration or dismissal of notifications
- Web-push or mobile push notifications

---

## 📌 Final Notes

- The notification system is built to be simple, persistent, and tied to real-time updates.
- Any new notification type must be evaluated to ensure it fits the in-app notification flow and doesn’t rely on external delivery.
