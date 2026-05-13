import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { ErrorBoundary } from '@/app/ErrorBoundary';

const HomePage = lazy(() => import('@/pages/HomePage'));
const VenuesPage = lazy(() => import('@/pages/VenuesPage'));
const VenueDetailPage = lazy(() => import('@/pages/VenueDetailPage'));
const EventsPage = lazy(() => import('@/pages/EventsPage'));
const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const BecomeAnAllyPage = lazy(() => import('@/pages/BecomeAnAllyPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));

const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'));
const DashboardSpacesPage = lazy(() => import('@/pages/dashboard/DashboardSpacesPage'));
const DashboardApplicationsPage = lazy(() => import('@/pages/dashboard/DashboardApplicationsPage'));
const DashboardBookingsPage = lazy(() => import('@/pages/dashboard/DashboardBookingsPage'));
const DashboardPagesPage = lazy(() => import('@/pages/dashboard/DashboardPagesPage'));
const DashboardMediaPage = lazy(() => import('@/pages/dashboard/DashboardMediaPage'));
const DashboardSettingsPage = lazy(() => import('@/pages/dashboard/DashboardSettingsPage'));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<FullPageSpinner />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/venues', element: withSuspense(<VenuesPage />) },
      { path: '/venues/:slug', element: withSuspense(<VenueDetailPage />) },
      { path: '/events', element: withSuspense(<EventsPage />) },
      { path: '/events/:slug', element: withSuspense(<EventDetailPage />) },
      { path: '/about', element: withSuspense(<AboutPage />) },
      { path: '/contact', element: withSuspense(<ContactPage />) },
      { path: '/become-an-ally', element: withSuspense(<BecomeAnAllyPage />) },
      { path: '/privacy', element: withSuspense(<PrivacyPage />) },
      { path: '/terms', element: withSuspense(<TermsPage />) },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/sign-in', element: withSuspense(<SignInPage />) },
      { path: '/sign-up', element: withSuspense(<SignUpPage />) },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: withSuspense(<DashboardOverviewPage />) },
      { path: 'spaces', element: withSuspense(<DashboardSpacesPage />) },
      { path: 'bookings', element: withSuspense(<DashboardBookingsPage />) },
      { path: 'applications', element: withSuspense(<DashboardApplicationsPage />) },
      { path: 'pages', element: withSuspense(<DashboardPagesPage />) },
      { path: 'media', element: withSuspense(<DashboardMediaPage />) },
      { path: 'settings', element: withSuspense(<DashboardSettingsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/404" replace /> },
  { path: '/404', element: withSuspense(<NotFoundPage />) },
]);
