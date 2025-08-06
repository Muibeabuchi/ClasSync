# 📱 Classynk - Mobile UI/UX Design Brief

## 🎯 Goal

Design and implement a **mobile-first UI** for Classynk that **feels like a native mobile app** on both Android and iOS devices. The interface should prioritize **usability, responsiveness, and a sleek, professional look** while leveraging modern web tech like **TailwindCSS, Shadcn UI, and Framer Motion**.

---

## 🧱 Layout Structure

### ✅ Mobile-First Viewport Setup

- Ensure `viewport` meta tag is configured:
  ```html
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1"
  />
  ```
- Pages should take up full screen height:
  ```ts
  className = 'h-[100dvh] overflow-hidden flex flex-col';
  ```

### ✅ Bottom Navigation

Implement a fixed bottom navigation for students using Shadcn UI or custom components:

- Tabs:
  - 🏠 Home
  - 📚 Courses
  - ✅ Check In
  - 📬 Inbox
  - 👤 Profile

Use icon + label buttons with:

```ts
className = 'flex flex-col items-center text-xs text-muted-foreground';
```

### ✅ Fullscreen Pages with Transitions

Use Framer Motion or CSS animations for smooth page transitions:

- Slide-in, fade-in effects
- Use modal sheets and drawers for deep navigation

---

## 🎨 UI Styling Guidelines

### Typography

- Use system UI fonts:
  ```css
  font-sans: ui-sans-serif, system-ui;
  ```
- Font sizes: `text-base` for body, `text-lg` for section titles, `text-sm` for secondary text

### Color Scheme

- Inherit colors from Tailwind's default theme
- Do not hardcode HSL values — use theme tokens like:
  - `text-primary`, `bg-muted`, `border-input`

### Component Styling

- All interactive elements should:
  - Be touch-friendly (minimum 48x48px)
  - Have `transition` and `active:scale-95` for tap feedback
- Use subtle shadows and rounded corners:
  - `rounded-2xl shadow-sm`
- Buttons and cards should have subtle hover and press states:
  ```ts
  className = 'transition duration-150 active:scale-95';
  ```

---

## 📦 Component Patterns

### 🟩 Course Card

- Stacked layout (Course Name, Code, Lecturer)
- Rounded, touch-friendly
- Optional subtle animation on mount
- Swipeable for mobile interactions (optional)

### 🟦 Attendance Check-in

- Fixed bottom action button: “Take Attendance”
- Display GPS status + code input
- Large status text: “You’re within range ✅” or “Move closer 📍”

### 🟨 Modals & Sheets

- Use Shadcn's `Sheet`, `Dialog`, or `Drawer`
- Full-width for mobile
- Swipe to close or tap outside
- For onboarding, filters, or session detail views

---

<!-- ## 📡 PWA Setup (Optional)

- Enable installable PWA shell
- Configure `manifest.json` and service worker
- Add splash screen, icons, and standalone launch mode -->

---

## 🔄 Interactions

### Page Transitions

Use Framer Motion for:

- Slide in/out for full-page views
- Fade for modals and list transitions

### Tap Feedback

- Add active states (`active:bg-muted`, `active:scale-95`)
- Use ripple effect with custom class (optional)

<!-- ### Pull to Refresh

- For mobile dashboard or course list -->

---

<!-- ## 🧪 Testing Instructions

1. Test on real Android and iOS devices or emulators
2. Try:
   - Navigating between screens
   - Opening drawers and modals
   - Joining a course
   - Taking attendance via GPS + code
3. Evaluate for:
   - Scroll locking
   - Tap responsiveness
   - Transition smoothness
   - Offline experience -->

---

## 📚 Dependencies

- ✅ Tailwind CSS
- ✅ Shadcn UI
- ✅ Framer Motion (optional)
  <!-- - ✅ Headless UI (for accessible modals & menus) -->
  <!-- - ✅ Next.js or React with routing support -->

---

## ✅ UX Goals Checklist

| Feature           | Native Feel            | Mobile Optimized | Notes                      |
| ----------------- | ---------------------- | ---------------- | -------------------------- | --------------------------- | --- |
| Bottom Nav Bar    | ✅                     | ✅               | Sticky, icon + label style |
| Fullscreen Pages  | ✅                     | ✅               | Slide & fade transitions   |
| Modal Sheets      | ✅                     | ✅               | Swipe to close             |
| Tap Feedback      | ✅                     | ✅               | Scale or ripple effect     |
| <!--              | PWA Support (Optional) | ✅               | ✅                         | Installable + splash screen | --> |
| <!--              | Offline Retry States   | ✅               | ✅                         | For GPS, network fail       | --> |
| Touch Target Size | ✅                     | ✅               | 48x48px minimum            |

---

## 📌 Final Notes

Focus on **clarity, responsiveness, and delightful micro-interactions**. Students should enjoy using Classynk on their phones just like any other native app. The entire UI should be **fluid, intuitive, and visually pleasing**, with seamless gesture support and snappy performance.
