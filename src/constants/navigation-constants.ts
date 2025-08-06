import {
  Home,
  BookOpen,
  Users,
  ClipboardList,
  // Bell,
  //  CreditCard
} from 'lucide-react';

export const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    to: '',
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    to: '/courses',
  },

  {
    id: 'classlists',
    label: 'ClassLists',
    icon: ClipboardList,
    to: 'classLists',
  },
  {
    id: 'join-requests',
    label: 'Join Requests',
    icon: Users,
    to: 'joinRequests',
  },
  // {
  //   id: 'notifications',
  //   label: 'Notifications',
  //   icon: Bell,
  //   to: 'notifications',
  //   badge: '5',
  // },
  // {
  //   id: 'billing',
  //   label: 'Billing',
  //   icon: CreditCard,
  //   to: 'billing',
  //   badge: null,
  // },
];
