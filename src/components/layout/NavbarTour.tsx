import { useState, useEffect } from 'react';
import { Joyride, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { useAuth } from '@/providers/useAuth';

interface NavbarTourProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function NavbarTour({ mobileOpen, setMobileOpen }: NavbarTourProps) {
  const { user } = useAuth();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 1. Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Check if the tour has already been completed for this specific user & role
  useEffect(() => {
    if (!user) return;
    
    // Check localStorage
    const storageKey = `mx_tour_completed_${user.id}_${user.role}`;
    const isCompleted = localStorage.getItem(storageKey);
    
    if (!isCompleted && (user.role === 'PILOT' || user.role === 'COACH' || user.role === 'COMPANY')) {
      // Delay start slightly to ensure Navbar is fully rendered in the DOM
      const timer = setTimeout(() => {
        setRun(true);
        setStepIndex(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // 3. Define the steps for each role
  const getSteps = (): Step[] => {
    if (!user) return [];
    
    const steps: Step[] = [];

    // Step 1: Welcome Logo
    steps.push({
      target: '[data-tour="nav-logo"]',
      title: 'Welcome to MotoCross!',
      content: 'Let\'s take a quick tour of your navigation menu to help you get started.',
      skipBeacon: true,
      placement: 'bottom',
    });

    if (isMobile) {
      // Step 2: Hamburger menu button
      steps.push({
        target: '[data-tour="nav-mobile-menu-btn"]',
        title: 'Navigation Menu',
        content: 'Tap here to open the menu drawer where you can access your options.',
        placement: 'bottom',
      });
    }

    // Role specific links
    if (user.role === 'PILOT') {
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-dashboard"]' : '[data-tour="nav-dashboard"]',
        title: 'Your Dashboard',
        content: 'View your upcoming bookings, statistics, recent activities, and quick summaries of your profile.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-map"]' : '[data-tour="nav-map"]',
        title: 'Explore Tracks',
        content: 'Find and explore MX tracks around you, view their schedules, and check their details on our interactive map.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-reservations"]' : '[data-tour="nav-reservations"]',
        title: 'Manage Bookings',
        content: 'Keep track of all your track reservations and training sessions, check their status, or make changes.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-profile"]' : '[data-tour="nav-profile"]',
        title: 'Your Profile',
        content: 'Update your personal details, profile picture, motorcycle specs, and review your rider stats.',
        placement: 'bottom',
      });
    } else if (user.role === 'COACH') {
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-dashboard"]' : '[data-tour="nav-dashboard"]',
        title: 'Coach Dashboard',
        content: 'Get a quick overview of your upcoming training sessions, earnings, and recent student reviews.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-availability"]' : '[data-tour="nav-availability"]',
        title: 'Set Availability',
        content: 'Manage your training hours and set up the time slots when pilots can book your classes.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-lessons"]' : '[data-tour="nav-lessons"]',
        title: 'Manage Lessons',
        content: 'View your student list, approve pending session bookings, and track your history of classes.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-map"]' : '[data-tour="nav-map"]',
        title: 'Track Map',
        content: 'Browse the map to find active tracks where you can conduct your coaching sessions.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-settings"]' : '[data-tour="nav-settings"]',
        title: 'Coaching Settings',
        content: 'Configure your hourly rates, teaching specialties, and custom session descriptions.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-profile"]' : '[data-tour="nav-profile"]',
        title: 'Your Profile',
        content: 'Manage your professional coach bio, credentials, experience, and display picture.',
        placement: 'bottom',
      });
    } else if (user.role === 'COMPANY') {
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-dashboard"]' : '[data-tour="nav-dashboard"]',
        title: 'Business Dashboard',
        content: 'Monitor your track\'s revenue, booking trends, popular slots, and customer activity summaries.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-tracks"]' : '[data-tour="nav-tracks"]',
        title: 'Track Management',
        content: 'View and edit your existing MX tracks, update their schedules, prices, conditions, and amenities.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-create-track"]' : '[data-tour="nav-create-track"]',
        title: 'Register New Track',
        content: 'Add a new MX track to the platform by uploading photos, location, details, and opening hours.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-map"]' : '[data-tour="nav-map"]',
        title: 'Interactive Map',
        content: 'Locate your tracks on the map and see how they appear to pilots and coaches browsing the area.',
        placement: 'bottom',
      });
      steps.push({
        target: isMobile ? '[data-tour="nav-mobile-profile"]' : '[data-tour="nav-profile"]',
        title: 'Company Profile',
        content: 'Manage your business profile, contact details, payment information, and official brand assets.',
        placement: 'bottom',
      });
    }

    // Theme selector step
    steps.push({
      target: isMobile ? '[data-tour="nav-mobile-theme-toggle"]' : '[data-tour="nav-theme-toggle"]',
      title: 'Theme Selector',
      content: 'Switch between Light and Dark mode at any time for your viewing comfort.',
      placement: 'bottom',
    });

    // Logout step
    steps.push({
      target: '[data-tour="nav-logout"]',
      title: 'Sign Out',
      content: 'Safely sign out of your account when you are done.',
      placement: 'bottom',
    });

    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  // 4. Programmatic Mobile Drawer State Toggle
  // Based on the stepIndex we are viewing, open/close the mobile menu if isMobile is true.
  useEffect(() => {
    if (!run || !isMobile || totalSteps === 0) return;
    
    // index 0: logo (closed)
    // index 1: hamburger button (closed)
    // index 2 to totalSteps-2: mobile menu items and mobile theme toggle (open)
    // index totalSteps-1: logout button in header (closed)
    const shouldBeOpen = stepIndex >= 2 && stepIndex <= totalSteps - 2;
    if (shouldBeOpen !== mobileOpen) {
      setMobileOpen(shouldBeOpen);
    }
  }, [stepIndex, isMobile, totalSteps, mobileOpen, setMobileOpen, run]);

  // 5. Handle complete/skip actions and step navigation
  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Navigate to next or previous step
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Mark onboarding as completed in localStorage
      if (user) {
        const storageKey = `mx_tour_completed_${user.id}_${user.role}`;
        localStorage.setItem(storageKey, 'true');
      }
      setRun(false);
      setMobileOpen(false);
    }
  };

  // Perform conditional return AFTER all hooks have executed unconditionally
  if (!user || !run) return null;

  return (
    <Joyride
      steps={steps}
      stepIndex={stepIndex}
      run={run}
      continuous={true}
      onEvent={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        overlay: {
          mixBlendMode: 'hard-light' as const,
        },
      }}
      options={{
        arrowColor: 'transparent',
        overlayColor: 'rgba(15, 23, 42, 0.75)',
        spotlightRadius: 16,
        zIndex: 10000,
        showProgress: false,
        blockTargetInteraction: true,
        overlayClickAction: false,
      }}
    />
  );
}

// 6. Premium Custom Tooltip Component aligned with design guidelines
function CustomTooltip({
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
}: any) {
  const progressPercent = ((index + 1) / size) * 100;

  return (
    <div
      {...tooltipProps}
      className="max-w-[350px] w-full rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800/85 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 animate-scaleIn select-none"
      style={{
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgba(249, 115, 22, 0.15)',
      }}
    >
      {/* Title & Progress Badge */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h4 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
          {step.title}
        </h4>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 uppercase tracking-wider shrink-0">
          Step {index + 1} of {size}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Short and Clear Description */}
      <div className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-5 font-medium">
        {step.content}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
        {/* Skip button */}
        <button
          {...skipProps}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Skip tour
        </button>

        <div className="flex items-center gap-2">
          {/* Back button (hidden for step 1) */}
          {index > 0 && (
            <button
              {...backProps}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Back
            </button>
          )}

          {/* Next/Finish button */}
          <button
            {...primaryProps}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-black shadow-md shadow-orange-500/20 dark:shadow-orange-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {index === size - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
