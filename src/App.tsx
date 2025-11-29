import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminLayout } from '@/components/admin/AdminLayout';


// Public pages
import { Home } from '@/pages/Home';
import { Projects } from '@/pages/Projects';
import { ProjectDetails } from '@/pages/ProjectDetails';
import { About } from '@/pages/About';
import { Apply } from '@/pages/Apply';
import { Donate } from '@/pages/Donate';
import { Contact } from '@/pages/Contact';


// Admin pages
import { AdminLogin } from '@/pages/admin/Login';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { ProjectsList } from '@/pages/admin/ProjectsList';
import { ProjectForm } from '@/pages/admin/ProjectForm';
import { ProjectView } from '@/pages/admin/ProjectView';
import { ApplicationsList } from '@/pages/admin/ApplicationsList';
import { ApplicationView } from '@/pages/admin/ApplicationView';
import { ContentManagement } from '@/pages/admin/ContentManagement';

import { DonationsList } from '@/pages/admin/DonationsList';
import { DonationView } from '@/pages/admin/DonationView';
import { ContactManagement } from '@/pages/admin/ContactManagement';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
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
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  }
/>
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;