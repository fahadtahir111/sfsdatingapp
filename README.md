# 💖 SFS Elite: The Ultimate Hybrid Social & Dating Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**SFS Elite** is a premium, high-performance hybrid platform that merges the best of dating (Tinder), social media (Instagram/TikTok), and professional networking (LinkedIn). Designed with a "Forced Dark Luxury" aesthetic, it offers an elite experience for users looking for meaningful connections, content creation, and professional growth.

---

## ✨ Core Features

### 🔍 Discover (Elite Dating)
- **Swiping Interface**: Smooth, gesture-based swiping to like, pass, or send roses.
- **Roses (Premium Likes)**: Stand out by gifting roses to potential matches.
- **Smart Filtering**: Advanced filters for age, distance, education, and lifestyle preferences.
- **Trust Scores**: Verified profiles with AI-calculated trust scores for safety.

### 📱 Social Ecosystem
- **Dynamic Feed**: High-fidelity social feed supporting images, videos, and status updates.
- **Stories**: Disappearing 24-hour stories with rich media support.
- **Reels**: Full-screen, immersive vertical video scrolling with high-performance playback.
- **Interactions**: Like, comment, and share features optimized for engagement.

### 🎙️ Communication Hub
- **Real-time Messaging**: Instant chat with read receipts and typing indicators.
- **Audio Messaging**: High-quality voice notes for more personal communication.
- **HD Video & Audio Calls**: Integrated video and audio calling powered by Stream SDK.
- **Call History**: Integrated tracking of call durations and history.

### 🏢 Elite Networking & Boardroom
- **Professional Mode**: Toggle between dating and networking modes with a separate professional profile.
- **Boardrooms**: Virtual spaces for elite hosts to gather and discuss high-level topics.
- **Events**: Discover and RSVP to exclusive, elite-only events.
- **Vouching System**: Professional credibility built through community vouches.

### 💎 Membership & SaaS Features
- **Subscription Tiers**: Signature and Elite tiers with exclusive features.
- **Onboarding Wizard**: A 4-step identity verification and profile setup process.
- **Incognito Mode**: Premium privacy features to browse without being seen.
- **Referral Program**: Growth-driven referral system with rewards.

---

## 🎨 UI & Aesthetics

The platform follows a **Forced Dark Luxury Theme** designed to feel premium and exclusive.

- **Color Palette**: 
  - `Background`: Deep Charcoal/Black (#050505)
  - `Primary`: Vibrant Deep Pink (#FF1493)
  - `Surface`: Glassmorphic cards with `#0a0a0a` backgrounds.
- **Visual Effects**:
  - **Glassmorphism**: Backdrop blur effects on headers and popovers.
  - **Luxury Mesh**: Subtle radial gradients and mesh patterns for background depth.
  - **Glow & Gradients**: Premium text glows and primary-to-deep-pink gradients.
- **Animations**: Powered by **Framer Motion** and **GSAP** for butter-smooth transitions.
- **Typography**: `Outfit` for headings and `Inter` for clean, readable body text.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Prisma](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth) & [Jose (JWT)](https://github.com/panva/jose)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Real-time**: [Stream SDK](https://getstream.io/) (Video/Audio Calls)
- **Media**: [Cloudinary](https://cloudinary.com/) (Image/Video hosting)
- **Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Swiper.js](https://swiperjs.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)

---

## 📂 Folder Structure

```text
d:\sfsdatingapp
├── 📁 prisma               # Database schema and migrations
│   ├── schema.prisma       # Full data model (Users, Matches, Reels, etc.)
│   └── seed.ts             # Development data seeding
├── 📁 public               # Static assets (images, icons)
├── 📁 src                  # Application Source
│   ├── 📁 app              # Next.js App Router (Routes & Pages)
│   │   ├── 📁 actions      # Server Actions for DB operations
│   │   ├── 📁 admin        # Admin Dashboard and management
│   │   ├── 📁 api          # API Routes (Notifications, Posts, etc.)
│   │   ├── 📁 boardroom    # Boardroom feature routes
│   │   ├── 📁 chat         # Real-time messaging interface
│   │   ├── 📁 discover     # Swiping/Dating interface
│   │   ├── 📁 feed         # Social media feed
│   │   ├── 📁 reels        # Full-screen video player
│   │   ├── 📁 profile      # User profiles & settings
│   │   └── layout.tsx      # Root layout & providers
│   ├── 📁 components       # Reusable UI Components
│   │   ├── 📁 ui           # Atomic components (Buttons, Inputs)
│   │   ├── 📁 Feed         # Social Feed specific components
│   │   └── 📁 Chat         # Messaging components
│   ├── 📁 lib              # Utility functions, Prisma client, Cloudinary
│   ├── 📁 store            # State management (Zustand)
│   └── 📁 types            # TypeScript interfaces and types
├── .env                    # Environment variables
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account (for Auth)
- Cloudinary account (for Media)

### 2. Installation
```bash
git clone <your-repo-url>
cd sfsdatingapp
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_postgresql_url"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
STREAM_API_KEY="your_stream_key"
STREAM_API_SECRET="your_stream_secret"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
npm run seed  # Optional: Seed development data
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔒 Security & Privacy
- **End-to-End Auth**: Managed via Supabase with secure session handling.
- **Media Security**: Cloudinary signed uploads and transformations.
- **Data Privacy**: Incognito modes and granular notification controls.

---

## 📄 License
This project is private and proprietary. All rights reserved.

---
Created with ❤️ by Antigravity
