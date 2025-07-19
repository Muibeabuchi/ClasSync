import { Home, BookOpen, Users, Bell, CreditCard } from 'lucide-react';

export const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    to: '',
    badge: null,
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    to: '/courses',
    badge: '3',
  },

  {
    id: 'join-requests',
    label: 'Join Requests',
    icon: Users,
    to: 'joinRequests',
    badge: '8',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    to: 'notifications',
    badge: '5',
  },
  {
    id: 'classlists',
    label: 'ClassLists',
    icon: Users,
    to: 'classLists',
    badge: null,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    to: 'billing',
    badge: null,
  },
];
