# Sparkle Dry Cleaners — Frontend

Modern light-theme React frontend. **Zero Tailwind. Zero CSS frameworks. Plain CSS only.**

## Stack
- React 18 + React Router v6
- Plain CSS (custom properties, Flexbox, Grid)
- Recharts for analytics charts
- Lucide React for icons
- React Hot Toast for notifications
- Axios for API calls

## Theme Colors
| Token         | Value     |
|---------------|-----------|
| Primary       | `#614668` |
| Secondary     | `#5D748E` |
| Background    | `#F2E1E1` |
| Surface/Card  | `#FFFFFF` |
| Border        | `#C6BCC0` |
| Text          | `#2A3C52` |
| Muted Text    | `#5D748E` |

## Folder Structure
```
src/
  components/
    common/       Navbar
    hero/         HeroSection
    sections/     ServicesSection, HowItWorksSection,
                  TrackingPreviewSection, OtherSections
    dashboard/    DashboardLayout, DashboardWidgets
  pages/
    dashboard/    CustomerDashboard, StaffDashboard,
                  AdminDashboard, OrderDetail, CreateOrder
    LandingPage, LoginPage, RegisterPage, TrackPage, NotFound
  context/        AuthContext
  services/       api.js
  data/           index.js
  styles/
    globals.css   CSS variables, reset, layout, buttons, badges
    navbar.css    Navbar component
    hero.css      Hero section
    sections.css  All landing page sections + footer
    dashboard.css Dashboard layout, sidebar, widgets, tables
    auth.css      Auth pages, Track page, Order/Create pages
```

## Getting Started
```bash
npm install
npm run dev
```

Make sure the backend API is running on `http://localhost:5000`.
