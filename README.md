# 🐯 Tiger Life - Grambling State University Campus Platform

Tiger Life is a full-stack web application designed specifically for the students of **Grambling State University**. It provides a vibrant and secure platform for buying and selling used items, offering and requesting student services, sharing events, and connecting with peers through real-time messaging.

---

## 🚀 Live Site

**[https://tigerlife.netlify.app](https://tigerlife.netlify.app)**

---

## 🧑🏽‍💻 Tech Stack

### Frontend

-   **React** with **TypeScript**
-   **Tailwind CSS** for utility-first styling
-   **React Router** for client-side routing
-   **React Query** for data fetching and caching

### Backend

-   **Supabase** for authentication, database, and storage
-   **Stripe** for payments
-   **Deno** Edge Functions (via Supabase CLI) for serverless backend logic

---

## 📦 Features Overview

### 🏠 Homepage

-   Simple layout with large navigation cards
-   Sections for **Marketplace**, **Services**, and **Events**

### 🛍️ Marketplace

-   Post, browse, and search products
-   Filter by date, price, or name
-   View item details and message sellers
-   Secure payment via Stripe

### 🧰 Services

-   Offer services like tutoring, graphic design, haircutting, and more
-   Students can request services and chat with providers

### 🎟️ Events

-   Placeholder page for now
-   Future feature: allow clubs and organizations to post event registrations

### 📬 Messaging

-   Real-time 1:1 messaging between buyers and sellers/service providers
-   Stored in Supabase for persistence

### 👤 Profile

-   Displays user info, joined date, profile image
-   Order history and list of posted items/services

---

## 💰 Stripe Integration

-   Stripe Checkout is used to handle all purchases securely
-   After successful payment, users are redirected to `/checkout-success?session_id=...`
-   The app verifies the session and updates the order status to `completed`

> **Note:** In development, the default fallback origin is `http://localhost:8082`. In production, it's controlled via the `SITE_URL` environment variable.

---

## 🧱 Database Schema (Supabase)

### `users`

-   id (uuid)
-   full_name (text)
-   email (text)
-   profile_image (text)
-   joined_at (timestamp)
-   is_admin (boolean)

### `products`

-   id, title, description, price, image_url, seller_id, created_at, is_active

### `services`

-   id, title, description, price, image_url, provider_id, created_at, is_active

### `orders`

-   id, buyer_id, item_id, item_type, seller_id, price, stripe_session_id, status, created_at

### `messages`

-   id, sender_id, receiver_id, content, sent_at

### `events`

-   id, title, description, event_datetime, location, organizer_id, is_approved, created_at

---

## ⚙️ Local Development Setup

### Prerequisites

-   Node.js + npm
-   Supabase CLI
-   Stripe account

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/tiger-life.git

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Start Supabase functions (in a separate terminal)
supabase start
supabase functions serve create-checkout
```

---

## 🌐 Deployment (Netlify + Supabase)

### Netlify Environment Variables

Set the following in the Netlify dashboard:

```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

### Supabase Secrets (Production)

```bash
supabase secrets set SITE_URL=https://tigerlife.netlify.app
supabase secrets set STRIPE_SECRET_KEY=<your_stripe_secret_key>
```

### Netlify Redirects for SPA Routing

In `/public/_redirects`:

```
/*    /index.html   200
```

---

## 📌 Developer Notes

-   AuthGuard is used to protect private routes
-   Stripe session ID is injected by Stripe and verified in the `/checkout-success` page
-   Supabase Row Level Security (RLS) policies are configured for user data access

---

## 🏁 Coming Soon

-   Event registration pages
-   Ratings and reviews for products/services

---

## 🐅 Built for Grambling State University

_"Where everybody is somebody"_
