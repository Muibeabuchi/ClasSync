import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { ThemeToggle } from '@/components/theme-toggle';
import { GraduationCap, Shield, Clock, Users } from 'lucide-react';
import { useGoogleSignIn } from '../hooks/use-google-auth';

const LoginPage = () => {
  const loginWithGoogle = useGoogleSignIn();
  const handleGoogleLogin = async () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-background dark:via-muted/20 dark:to-background">
      {/* Theme Toggle - Fixed position */}
      {/* <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div> */}

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-12 flex-col justify-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-white/15"></div>
            <div className="absolute top-1/2 right-32 w-16 h-16 rounded-full bg-white/10"></div>
          </div>

          <div className="relative z-10">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold">Class Sync</h1>
            </div>

            {/* Tagline */}
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Smart, Secure
              <br />
              <span className="text-primary-foreground/80">
                Attendance Management
              </span>
            </h2>

            <p className="text-xl text-primary-foreground/70 mb-12 leading-relaxed">
              Streamline your classroom experience with intelligent attendance
              tracking, real-time insights, and seamless integration with your
              university systems.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/70">
                  University-grade security
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/70">
                  Real-time attendance tracking
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/70">
                  Collaborative classroom tools
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile branding (visible only on mobile) */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Class Sync
                </h1>
              </div>
              <p className="text-muted-foreground">
                Smart, Secure Attendance Management
              </p>
            </div>

            {/* Login Card */}
            <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Welcome Back to Class Sync
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in with your university Google account to continue.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Google Login Button */}
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-12 bg-card hover:bg-muted text-foreground border shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                  variant="outline"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      Secure university access
                    </span>
                  </div>
                </div>

                {/* Security note */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Protected by your {`university's`} authentication system
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <div
                  //   href="#"
                  className="text-primary hover:text-primary/80"
                >
                  Terms of Service
                </div>{' '}
                and{' '}
                <div
                  //   href="#"
                  className="text-primary hover:text-primary/80"
                >
                  Privacy Policy
                </div>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
