import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
// import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  Users,
  BarChart3,
  Bell,
  Building2,
  GraduationCap,
  UserCheck,
  Upload,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Target,
  Smartphone,
  Settings,
  Shield,
  TrendingUp,
  Globe,
} from 'lucide-react';
// import { Playfair_Display } from 'next/font/google';
// import Image from 'next/image';
import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: ClassSyncLanding,
});

// Typewriter Effect Component
function TypewriterText({
  text,
  delay = 0,
  speed = 100,
}: {
  text: string;
  delay?: number;
  speed?: number;
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        },
        currentIndex === 0 ? delay : speed,
      );

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, speed, text]);

  return <span>{displayText}</span>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// const playfair = Playfair_Display({ subsets: ['latin'] });

function ClassSyncLanding() {
  // const [mounted, setMounted] = useState(false);
  // const { scrollYProgress } = useScroll();
  // const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white">
                Clas<span className="text-blue-400">synk</span>
              </span>
            </motion.div>

            {/* Center Navigation - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="."
                className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
              >
                Home
              </Link>
              <div className="relative group">
                <button className="flex items-center text-sm text-gray-300 hover:text-white font-medium transition-colors">
                  Features
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <Link
                to="."
                className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="."
                className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="."
                className="text-sm text-gray-300 hover:text-white font-medium transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-3 sm:px-4 md:px-6 py-2 rounded-lg text-xs sm:text-sm min-h-[40px] touch-manipulation">
                  Get Started
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button className="lg:hidden p-2 text-gray-400 hover:text-gray-300 transition-colors min-h-[40px] min-w-[40px] touch-manipulation">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 relative overflow-hidden bg-gray-900">
        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left order-2 lg:order-1"
            >
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-75 animate-pulse"></div>
                <Badge
                  variant="secondary"
                  className="relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-200"
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Trusted by 500+ Universities
                </Badge>
              </div>

              <h1
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-white leading-tight"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <TypewriterText
                  text="Rethink Attendance."
                  delay={500}
                  speed={80}
                />
                <br />
                <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  <TypewriterText
                    text="The Smarter Way."
                    delay={2000}
                    speed={100}
                  />
                </span>
              </h1>

              <p
                className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                ClassSync helps universities and lecturers take accurate,
                fraud-proof attendance using GPS, session timers, and real-time
                dashboards.
              </p>

              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base w-full xs:w-auto min-h-[48px] touch-manipulation"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent hover:bg-gray-800 text-white border-gray-600 font-semibold px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base w-full xs:w-auto min-h-[48px] touch-manipulation"
                >
                  Learn More
                </Button>
              </div>

              {/* Rating Section - Mobile Optimized */}
              <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start space-y-3 xs:space-y-0 xs:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-white">
                    4.9
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base text-gray-400">
                    500+ reviews
                  </span>
                  <div className="flex -space-x-1 sm:-space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-semibold"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Image - Hidden on mobile and tablet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative hidden lg:block order-1 lg:order-2"
            >
              <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm border border-gray-700/50">
                <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden flex items-center justify-center bg-gray-800/30">
                  <img
                    src="/undraw_remote-design-team_qfqr.svg"
                    alt="ClassSync remote design team collaboration"
                    className="w-full h-full object-contain p-4"
                  />
                  {/* Floating UI Elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  >
                    ✓ Live Session
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-700 shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">12 students checked in</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trusted By Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 sm:mt-16 lg:mt-20 text-center"
          >
            <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
              We are trusted by
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 opacity-60">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    G
                  </span>
                </div>
                <span className="font-semibold text-gray-400 text-xs sm:text-sm">
                  Google
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    U
                  </span>
                </div>
                <span className="font-semibold text-gray-400 text-xs sm:text-sm">
                  Udemy
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    K
                  </span>
                </div>
                <span className="font-semibold text-gray-400 text-xs sm:text-sm">
                  Khan Academy
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    C
                  </span>
                </div>
                <span className="font-semibold text-gray-400 text-xs sm:text-sm">
                  Codecademy
                </span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    A
                  </span>
                </div>
                <span className="font-semibold text-gray-400 text-xs sm:text-sm">
                  Cloud Academy
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Core Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Everything you need to modernize attendance tracking
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: 'GPS-Based Validation',
                description:
                  'Ensure students are physically present with location verification',
                color: 'text-blue-400',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Timed Sessions',
                description:
                  'Automated session control with customizable time windows',
                color: 'text-purple-400',
              },
              {
                icon: <Upload className="w-6 h-6" />,
                title: 'CSV Uploads',
                description:
                  'Bulk import student data and export attendance records',
                color: 'text-green-400',
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: 'Join Request Management',
                description:
                  'Approve or deny student attendance requests in real-time',
                color: 'text-orange-400',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Analytics Dashboard',
                description:
                  'Comprehensive insights and attendance pattern analysis',
                color: 'text-cyan-400',
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: 'Push Notifications',
                description:
                  'Real-time alerts for session updates and attendance status',
                color: 'text-pink-400',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-gray-700/50 bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className={feature.color}>{feature.icon}</span>
                    </div>
                    <CardTitle className="text-xl text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-900">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Join hundreds of smart educators already using ClassSync to
              modernize their classrooms and eliminate attendance fraud.
            </p>

            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 lg:py-6 w-full xs:w-auto min-h-[48px] touch-manipulation"
              >
                Start for Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 lg:py-6 bg-transparent border-gray-600 text-white hover:bg-gray-800 w-full xs:w-auto min-h-[48px] touch-manipulation"
              >
                Request a Demo
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 px-4">
              No credit card required • Free forever plan available • Setup in
              under 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/40 py-8 sm:py-12 px-4 bg-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ClassSync
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <Link
                to="."
                className="hover:text-white transition-colors touch-manipulation py-2"
              >
                Privacy
              </Link>
              <Link
                to="."
                className="hover:text-white transition-colors touch-manipulation py-2"
              >
                Terms
              </Link>
              <Link
                to="."
                className="hover:text-white transition-colors touch-manipulation py-2"
              >
                Support
              </Link>
              <Link
                to="."
                className="hover:text-white transition-colors touch-manipulation py-2"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800/40 text-center text-xs sm:text-sm text-gray-500">
            © 2024 ClassSync. All rights reserved. Built with ❤️ for educators
            worldwide.
          </div>
        </div>
      </footer>
    </div>
  );
}

// How It Works Component
function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const lecturerSteps = [
    {
      step: '01',
      title: 'Get Started in Minutes',
      subtitle: 'Sign Up & Onboard',
      description:
        'Create an account, select your role as a lecturer, and onboard with your details.',
      details: [
        'Choose your faculty and department',
        'Upload a class list using our clean CSV format',
        'Personalize your profile with a photo',
      ],
      icon: <UserCheck className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      note: "No paperwork. Just plug in your students and you're good to go.",
    },
    {
      step: '02',
      title: 'Powerful Course Setup',
      subtitle: 'Create a Course',
      description:
        'Set up courses with unique codes, link class lists, and configure attendance preferences.',
      details: [
        'Define course code and session year',
        'Assign pre-uploaded class lists',
        'Customize attendance rules like GPS radius, reading time, and session duration',
      ],
      icon: <Settings className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      note: "Set it once. Focus on teaching — we'll handle the logistics.",
    },
    {
      step: '03',
      title: 'Location-Smart Attendance',
      subtitle: 'Start Attendance',
      description:
        'Launch a session, and students within your range can check in.',
      details: [
        'Set a session timer (e.g. 5 minutes)',
        'Define location boundaries (50m–300m)',
        'Monitor live session activity',
      ],
      icon: <MapPin className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      note: 'Built-in GPS validation means only present students get counted.',
    },
  ];

  const studentSteps = [
    {
      step: '01',
      title: 'Quick Onboarding for Students',
      subtitle: 'Sign In & Onboard',
      description:
        'On first login, students fill in basic details and upload a passport photo.',
      details: [
        "Registration number must start with '202…'",
        'Select faculty, department, and year batch',
        'Upload a clear, official-looking photo',
      ],
      icon: <Smartphone className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      note: "Your identity matters. A simple setup ensures everyone's accountable.",
    },
    {
      step: '02',
      title: 'Find Your Course, Get Verified',
      subtitle: 'Join a Course',
      description: 'Search using a course code and submit a join request.',
      details: [
        'Lecturers verify your reg number against uploaded lists',
        'Only verified students are admitted',
        'Get notified once approved',
      ],
      icon: <Shield className="w-8 h-8" />,
      color: 'from-teal-500 to-blue-500',
      note: 'No unauthorized access. Only verified students can check in.',
    },
    {
      step: '03',
      title: 'Stay. Learn. Get Counted.',
      subtitle: 'Read Attendance',
      description:
        "When a session starts, tap 'Start Reading Attendance' and stay within range.",
      details: [
        'GPS-verified check-in',
        'Must remain connected for ~70% of session',
        'Automatically marked present when timer completes',
      ],
      icon: <Clock className="w-8 h-8" />,
      color: 'from-indigo-500 to-purple-500',
      note: 'Attendance that rewards presence — not quick logins.',
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-800/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            How ClassSync Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            From login to attendance — it&apos;s that simple.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center space-x-4 relative">
            {/* Animated background line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-blue-500 via-orange-500 to-purple-500 opacity-30"></div>
            </div>

            {/* Animated flowing dots */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <motion.div
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                animate={{
                  x: [-100, 100],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                animate={{
                  x: [-80, 120],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
              <motion.div
                className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                animate={{
                  x: [-60, 140],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
            </div>

            <motion.div
              className="flex items-center space-x-2 relative z-10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.7)',
                    '0 0 0 10px rgba(59, 130, 246, 0)',
                    '0 0 0 0 rgba(59, 130, 246, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
              <motion.span
                className="text-sm text-gray-300 font-medium"
                animate={{ color: ['#d1d5db', '#60a5fa', '#d1d5db'] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              >
                Lecturer
              </motion.span>
            </motion.div>

            <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-orange-500 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: [-32, 32] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <motion.div
              className="flex items-center space-x-2 relative z-10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(249, 115, 22, 0.7)',
                    '0 0 0 10px rgba(249, 115, 22, 0)',
                    '0 0 0 0 rgba(249, 115, 22, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.7,
                }}
              />
              <motion.span
                className="text-sm text-gray-300 font-medium"
                animate={{ color: ['#d1d5db', '#fb923c', '#d1d5db'] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.7,
                }}
              >
                Student
              </motion.span>
            </motion.div>

            <div className="w-8 h-px bg-gradient-to-r from-orange-500 to-purple-500 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ x: [-32, 32] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
            </div>

            <motion.div
              className="flex items-center space-x-2 relative z-10"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(147, 51, 234, 0.7)',
                    '0 0 0 10px rgba(147, 51, 234, 0)',
                    '0 0 0 0 rgba(147, 51, 234, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 1.4,
                }}
              />
              <motion.span
                className="text-sm text-gray-300 font-medium"
                animate={{ color: ['#d1d5db', '#c084fc', '#d1d5db'] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: 1.4,
                }}
              >
                Institution
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Lecturer Experience */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">
                Lecturer Experience
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              For Educators
            </h3>
            <p className="text-gray-400">
              Streamlined course management and attendance tracking
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lecturerSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                  className="relative z-10"
                >
                  <Card className="h-full border-gray-700/50 bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}
                      >
                        {step.icon}
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit mx-auto mb-2 border-gray-600 text-gray-300"
                      >
                        Step {step.step}
                      </Badge>
                      <CardTitle className="text-xl text-white mb-2">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 font-medium">
                        {step.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-center">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start text-sm text-gray-400"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-700/30 rounded-lg p-3 mt-4">
                        <p className="text-sm text-gray-300 italic">
                          &quot;{step.note}&quot;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Gradient shadow connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
              <div className="relative w-full h-1">
                {/* Main gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent blur-md"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent blur-lg"></div>

                {/* Intense center glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-8 bg-gradient-to-r from-blue-400/60 via-purple-400/80 to-pink-400/60 blur-xl rounded-full"></div>

                {/* Animated flowing particles */}
                <motion.div
                  className="absolute top-1/2 left-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: [0, 'calc(100vw - 8px)'],
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: [0, 'calc(100vw - 6px)'],
                    opacity: [0, 1, 1, 0],
                    scale: [0.3, 0.8, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Student Experience */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-4">
              <Users className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-medium">
                Student Experience
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">For Students</h3>
            <p className="text-gray-400">
              Simple, secure, and fair attendance tracking
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {studentSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                  className="relative z-10"
                >
                  <Card className="h-full border-gray-700/50 bg-gray-800/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}
                      >
                        {step.icon}
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit mx-auto mb-2 border-gray-600 text-gray-300"
                      >
                        Step {step.step}
                      </Badge>
                      <CardTitle className="text-xl text-white mb-2">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 font-medium">
                        {step.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-center">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-start text-sm text-gray-400"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-gray-700/30 rounded-lg p-3 mt-4">
                        <p className="text-sm text-gray-300 italic">
                          &quot;{step.note}&quot;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Gradient shadow connecting line for students */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
              <div className="relative w-full h-1">
                {/* Main gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/40 to-transparent blur-md"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent blur-lg"></div>

                {/* Intense center glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-8 bg-gradient-to-r from-orange-400/60 via-teal-400/80 to-indigo-400/60 blur-xl rounded-full"></div>

                {/* Animated flowing particles */}
                <motion.div
                  className="absolute top-1/2 left-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: [0, 'calc(100vw - 8px)'],
                    opacity: [0, 1, 1, 0],
                    scale: [0.5, 1, 1, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full transform -translate-y-1/2"
                  animate={{
                    x: [0, 'calc(100vw - 6px)'],
                    opacity: [0, 1, 1, 0],
                    scale: [0.3, 0.8, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Institution Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl p-12 border border-purple-500/20">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-medium">
                Institution Control
              </span>
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">
              Institutional Insights, Reimagined
            </h3>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Admin dashboards to track attendance trends across departments
              with custom rules for every department.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-left">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                  Monitor Campus-wide Attendance
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    View attendance logs for any course
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Track faculty activity
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Spot low-engagement patterns
                  </li>
                </ul>
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Globe className="w-5 h-5 text-blue-400 mr-2" />
                  Policy & Control
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Set default GPS radius and timeouts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Add school branding and permissions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Enable biometric add-ons (future)
                  </li>
                </ul>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3"
            >
              Learn About Institutional Access
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
