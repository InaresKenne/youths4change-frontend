# Youths4Change Frontend

Modern React + TypeScript web application for Youths4Change Initiative - A youth empowerment NGO operating across 8 African countries.

## 🌍 Overview

A comprehensive NGO management platform featuring project showcases, volunteer applications, donation processing, team profiles, dynamic content management, and an admin dashboard with analytics.

## 🚀 Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite 7.2.7
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Image Management**: Cloudinary
- **State Management**: React Context API
- **Icons**: Lucide React

## ✨ Key Features

### Public Features
- 🏠 **Dynamic Homepage** with video hero section and live statistics
- 📂 **Project Showcase** with country filters and detailed views
- 🖼️ **Project Galleries** for completed projects with multi-image upload
- 📝 **Volunteer Application** with real-time validation
- 💰 **Donation System** with project-specific contributions
- 👥 **About Page** with team profiles, founders, and core values
- 📞 **Contact Page** with regional offices and social media links
- 🎥 **Hero Video** support for YouTube/Vimeo embeds

### Admin Dashboard
- 📊 **Analytics Dashboard** with overview statistics
- 🗂️ **Project Management** (CRUD operations)
- 📸 **Multi-Image Upload** for project galleries (batch upload with captions)
- 📋 **Application Reviews** (approve/reject)
- 💵 **Donation Tracking** with statistics
- ⚙️ **Content Management** (hero section, mission, vision)
- 👔 **Team Management** (founders, executives, board, advisors)
- 🏢 **Contact Management** (offices, social media)
- 🎨 **Site Settings** (customizable content)

## 📋 Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager
- Cloudinary account (for image uploads)
- Backend API running (see backend README)

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/InaresKenne/youths4change-frontend.git
cd youths4change-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration (leave empty for Vite proxy in development)
VITE_API_URL=

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

For production, create `.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Run development server
```bash
npm run dev
```

Application runs on `http://localhost:5173`

### 5. Build for production
```bash
npm run build
```

## 📁 Project Structure

```
youths4change-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts
│   ├── components/
│   │   ├── admin/         # Admin layout components
│   │   ├── layout/        # Navbar, Footer
│   │   ├── ui/            # shadcn/ui components
│   │   │   ├── multi-image-upload.tsx  # Batch image upload
│   │   │   └── ...        # Other UI components
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   ├── pages/
│   │   ├── About.tsx      # About page
│   │   ├── Apply.tsx      # Application form
│   │   ├── Contact.tsx    # Contact page
│   │   ├── Donate.tsx     # Donation page
│   │   ├── Home.tsx       # Homepage with hero video
│   │   ├── ProjectDetails.tsx  # Project details with gallery
│   │   ├── Projects.tsx   # Projects listing
│   │   └── admin/         # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── ProjectsList.tsx
│   │       ├── ProjectForm.tsx
│   │       ├── ProjectView.tsx  # With gallery management
│   │       ├── ApplicationsList.tsx
│   │       ├── ApplicationView.tsx
│   │       ├── DonationsList.tsx
│   │       ├── ContentManagement.tsx
│   │       ├── ContactManagement.tsx
│   │       ├── TeamManagement.tsx
│   │       ├── Settings.tsx
│   │       └── Login.tsx
│   ├── services/          # API service layers
│   │   ├── api.ts         # Axios instance
│   │   ├── projectService.ts
│   │   ├── projectImageService.ts  # Gallery API
│   │   ├── applicationService.ts
│   │   ├── donationService.ts
│   │   ├── analyticsService.ts
│   │   ├── settingsService.ts
│   │   ├── contactService.ts
│   │   └── admin*.ts      # Admin services
│   ├── types/
│   │   ├── index.ts       # TypeScript interfaces
│   │   └── cloudinary.ts  # Cloudinary types
│   ├── utils/
│   │   ├── cloudinary.ts  # Image upload utilities
│   │   └── validation.ts  # Form validation
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # TailwindCSS config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## 🎨 Features Deep Dive

### Multi-Image Upload Component
- Batch file selection (up to 20 images)
- Individual captions for each image
- Real-time preview
- Drag-and-drop support
- Cloudinary integration
- Used in: Project Gallery, Team Profiles

### Hero Video Section
- YouTube and Vimeo support
- Auto-extract video ID from URLs
- Autoplay, loop, muted options
- Responsive video sizing
- Admin-configurable via Content Management

### Dynamic Country Management
- Countries pulled from Regional Offices database
- Automatic updates when offices are added/removed
- Used in: Projects, Applications, Donations filters

### Statistics Dashboard
- Real-time data from analytics API
- Young Leaders = Team Members + Approved Applications
- Countries, Active Projects, Lives Impacted counters
- Visual card-based layout

## 🔐 Authentication

Session-based authentication with protected routes:
- Public routes accessible to all
- Admin routes require login
- Auto-redirect to login for protected pages
- Session persistence across page reloads

## 🎯 Key Components

### Public Pages
- **Home**: Hero video, stats, mission statement, call-to-action
- **Projects**: Filterable grid with country selection
- **Project Details**: Full description, gallery (if completed), donation button
- **Apply**: Multi-step form with validation (name, email, phone, country, 100-500 word motivation)
- **Donate**: Project selection, amount input, country selection
- **About**: Founders, team members, core values, team roles
- **Contact**: Regional offices, social media, contact form

### Admin Pages
- **Dashboard**: Overview statistics and quick actions
- **Projects**: List, create, edit, delete, manage galleries
- **Applications**: Review, approve/reject, filter by status/country
- **Donations**: View all, statistics, filter by country/project
- **Content**: Edit hero section, mission/vision, page content
- **Team**: Manage founders, team members (executives, board, advisors)
- **Contact**: Manage offices, social media links
- **Settings**: Site-wide configuration

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New UI Components (shadcn/ui)

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### API Integration

All API calls go through service layers in `src/services/`:
- Automatic error handling
- Response caching (5 minutes for GET requests)
- TypeScript types for all responses
- Axios interceptors for auth tokens

## 🌐 Deployment

### Render.com Deployment

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: youths4change-frontend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    envVars:
      - key: NODE_VERSION
        value: 18.17.0
      - key: VITE_API_URL
        value: https://your-backend-url.com
      - key: VITE_CLOUDINARY_CLOUD_NAME
        value: your_cloud_name
      - key: VITE_CLOUDINARY_UPLOAD_PRESET
        value: your_upload_preset
```

2. Update `package.json`:
```json
{
  "scripts": {
    "preview": "vite preview --host 0.0.0.0 --port $PORT"
  }
}
```

3. Push to GitHub and connect to Render

### Environment Variables on Render
- `VITE_API_URL`: Backend API URL
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset
- `NODE_VERSION`: 18.17.0

## 🧪 Testing

### Manual Testing Checklist
- [ ] All public pages load without errors
- [ ] Forms validate correctly
- [ ] Admin login works
- [ ] CRUD operations function properly
- [ ] Images upload successfully
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hero video plays correctly
- [ ] Statistics display accurate data

## 🎨 Customization

### Updating Theme Colors
Edit `src/index.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

### Adding New Routes
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/layout/Navbar.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Authors

Youths4Change Development Team

## 🔗 Links

- Backend Repository: [youths4change-backend](https://github.com/InaresKenne/youths4change-backend)
- Live Site: [Coming Soon]
- Documentation: [Coming Soon]

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/InaresKenne/youths4change-frontend/issues)
- Email: support@youths4change.org

---

Built with ❤️ for youth empowerment in Africa
