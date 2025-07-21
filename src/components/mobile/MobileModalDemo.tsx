import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileFullScreenModal } from './MobileFullScreenModal';
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  Plus,
  Filter,
  Search,
  Star,
  Heart,
  Share,
  BookOpen,
  Calendar,
  MapPin,
} from 'lucide-react';

export const MobileModalDemo: React.FC = () => {
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [fullScreenModalOpen, setFullScreenModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [courseDetailsModalOpen, setCourseDetailsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    notifications: true,
    darkMode: false,
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setBottomSheetOpen(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Mobile Modal System</h1>
        <p className="text-muted-foreground">
          Demonstration of mobile-optimized modals and bottom sheets
        </p>
      </div>

      {/* Demo Buttons */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bottom Sheets</CardTitle>
            <CardDescription>
              Perfect for forms, filters, and quick actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setBottomSheetOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Contact Form Sheet
            </Button>

            <Button
              onClick={() => setFilterSheetOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter Options Sheet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Full Screen Modals</CardTitle>
            <CardDescription>
              Ideal for detailed views and complex interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setFullScreenModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Search & Browse Modal
            </Button>

            <Button
              onClick={() => setSettingsModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings Modal
            </Button>

            <Button
              onClick={() => setCourseDetailsModalOpen(true)}
              className="w-full"
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Course Details Modal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form Bottom Sheet */}
      <MobileBottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Contact Us"
        description="Send us a message and we'll get back to you soon"
        showDragHandle={true}
        swipeToClose={true}
        backdropDismiss={true}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us how we can help..."
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) =>
                handleInputChange('notifications', checked)
              }
            />
            <Label htmlFor="notifications">Send me email notifications</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setBottomSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Send Message
            </Button>
          </div>
        </form>
      </MobileBottomSheet>

      {/* Filter Options Bottom Sheet */}
      <MobileBottomSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Options"
        description="Customize your search results"
        snapPoints={[0.4, 0.7]}
        initialSnapPoint={0}
      >
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Technology', 'Design', 'Business', 'Science'].map(
                (category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    {category}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Rating</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="flex items-center gap-1 p-2 rounded-lg border"
                >
                  <Star className="w-4 h-4" />
                  <span>{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Show favorites only</span>
            <Switch />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1">
              Reset
            </Button>
            <Button
              className="flex-1"
              onClick={() => setFilterSheetOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </MobileBottomSheet>

      {/* Search & Browse Full Screen Modal */}
      <MobileFullScreenModal
        isOpen={fullScreenModalOpen}
        onClose={() => setFullScreenModalOpen(false)}
        title="Search & Browse"
        subtitle="Find what you're looking for"
        transition="slide-up"
        swipeToClose={true}
      >
        <div className="p-4 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              className="pl-10"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-3">Popular Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Web Development', count: 124 },
                { name: 'Data Science', count: 89 },
                { name: 'Mobile Apps', count: 67 },
                { name: 'UI/UX Design', count: 45 },
              ].map((category) => (
                <Card
                  key={category.name}
                  className="cursor-pointer hover:bg-accent/50"
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.count} courses
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recent Searches</h3>
            <div className="space-y-2">
              {['React Native', 'Machine Learning', 'Figma Design'].map(
                (search) => (
                  <div
                    key={search}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <span>{search}</span>
                    <Button variant="ghost" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </MobileFullScreenModal>

      {/* Settings Full Screen Modal */}
      <MobileFullScreenModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Settings"
        transition="slide-right"
        showBackButton={true}
      >
        <div className="divide-y divide-border">
          {[
            {
              icon: User,
              title: 'Profile',
              description: 'Manage your account information',
            },
            {
              icon: Bell,
              title: 'Notifications',
              description: 'Configure notification preferences',
            },
            {
              icon: Shield,
              title: 'Privacy & Security',
              description: 'Control your privacy settings',
            },
            {
              icon: CreditCard,
              title: 'Billing',
              description: 'Manage subscription and payments',
            },
            {
              icon: HelpCircle,
              title: 'Help & Support',
              description: 'Get help and contact support',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </MobileFullScreenModal>

      {/* Course Details Full Screen Modal */}
      <MobileFullScreenModal
        isOpen={courseDetailsModalOpen}
        onClose={() => setCourseDetailsModalOpen(false)}
        title="React Fundamentals"
        subtitle="Complete Course"
        headerActions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Course Hero */}
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-4 mt-4 flex items-center justify-center">
            <div className="text-white text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Course Preview</p>
            </div>
          </div>

          <div className="px-4 space-y-6">
            {/* Course Info */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge>Beginner</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span className="text-muted-foreground">(1,234 reviews)</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                Learn the fundamentals of React including components, state
                management, hooks, and modern development practices. Perfect for
                beginners looking to start their React journey.
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>12 weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div>
              <h3 className="font-semibold mb-3">What you'll learn</h3>
              <div className="space-y-2">
                {[
                  'React components and JSX syntax',
                  'State management with hooks',
                  'Event handling and forms',
                  'API integration and data fetching',
                  'Routing with React Router',
                  'Testing React applications',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h3 className="font-semibold mb-3">Instructor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                  JS
                </div>
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">
                    Senior React Developer
                  </p>
                </div>
              </div>
            </div>

            {/* Enroll Button */}
            <div className="sticky bottom-0 bg-background p-4 border-t -mx-4">
              <Button className="w-full" size="lg">
                Enroll Now - $99
              </Button>
            </div>
          </div>
        </div>
      </MobileFullScreenModal>
    </div>
  );
};

export default MobileModalDemo;
