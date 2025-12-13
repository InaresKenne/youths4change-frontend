import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminLayout } from '@/components/admin/AdminLayout';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Lazy load public pages
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Projects = lazy(() => import('@/pages/Projects').then(m => ({ default: m.Projects })));
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const About = lazy(() => import('@/pages/About').then(m => ({ default: m.About })));
const Apply = lazy(() => import('@/pages/Apply').then(m => ({ default: m.Apply })));
const Donate = lazy(() => import('@/pages/Donate').then(m => ({ default: m.Donate })));
const Contact = lazy(() => import('@/pages/Contact').then(m => ({ default: m.Contact })));

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/pages/admin/Login').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const ProjectsList = lazy(() => import('@/pages/admin/ProjectsList').then(m => ({ default: m.ProjectsList })));
const ProjectForm = lazy(() => import('@/pages/admin/ProjectForm').then(m => ({ default: m.ProjectForm })));
const ProjectView = lazy(() => import('@/pages/admin/ProjectView').then(m => ({ default: m.ProjectView })));
const ApplicationsList = lazy(() => import('@/pages/admin/ApplicationsList').then(m => ({ default: m.ApplicationsList })));
const ApplicationView = lazy(() => import('@/pages/admin/ApplicationView').then(m => ({ default: m.ApplicationView })));
const ContentManagement = lazy(() => import('@/pages/admin/ContentManagement').then(m => ({ default: m.ContentManagement })));
const DonationsList = lazy(() => import('@/pages/admin/DonationsList').then(m => ({ default: m.DonationsList })));
const DonationView = lazy(() => import('@/pages/admin/DonationView').then(m => ({ default: m.DonationView })));
const ContactManagement = lazy(() => import('@/pages/admin/ContactManagement').then(m => ({ default: m.ContactManagement })));
const AdminSettings = lazy(() => import('@/pages/admin/Settings').then(m => ({ default: m.AdminSettings })));
const TeamManagement = lazy(() => import('@/pages/admin/TeamManagement').then(m => ({ default: m.TeamManagement })));




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/apply" element={<Apply />} />
                        <Route path="/donate" element={<Donate />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="settings" element={<AdminSettings />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              }
            />

            {/* Admin Login (No Layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (Protected) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="projects" element={<ProjectsList />} />
                        <Route path="projects/new" element={<ProjectForm mode="create" />} />
                        <Route path="projects/:id" element={<ProjectView />} />
                        <Route path="projects/:id/edit" element={<ProjectForm mode="edit" />} />
                        <Route path="applications" element={<ApplicationsList />} />
                        <Route path="applications/:id" element={<ApplicationView />} />
                        <Route path="donations" element={<DonationsList />} />
                        <Route path="donations/:id" element={<DonationView />} />
                        <Route path="content" element={<ContentManagement />} />
                        <Route path="contact" element={<ContactManagement />} />
                        <Route path="team" element={<TeamManagement />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;