# 🌌 SkyVault

**SkyVault** is a content licensing marketplace for drone content creators to upload, license, and sell high-quality aerial videos and photos to marketers, real estate agents, tourism boards, media companies, and more.

---

## 🚀 Platform Overview

SkyVault bridges the gap between drone content creators and businesses looking for captivating aerial footage. It supports 4K/HD media licensing, role-based access, secure transactions (manual bank transfer in Phase 1), and a powerful admin dashboard for platform governance.

---

## 🧑‍💼 User Roles

| Role     | Description                                                |
|----------|------------------------------------------------------------|
| **Buyer**   | Purchases and downloads licensed drone content.            |
| **Creator** | Uploads, licenses, and earns revenue from aerial footage.  |
| **Admin**   | Manages users, content, orders, and platform configurations. |

---

## 🔑 Core Features

### ✈️ For Creators

- Upload high-resolution drone videos/photos (up to 4K).
- Assign license types (e.g., royalty-free, limited use).
- Set custom pricing and availability.
- Manage earnings and payouts.
- Track views, downloads, and engagement.

### 🛍️ For Buyers

- Browse/search categorized drone footage (location, theme, resolution).
- Preview media in low-resolution with watermark protection.
- Filter content by resolution, date, category, and creator.
- Manually upload bank transfer slip for order processing.
- Download high-resolution licensed content upon approval.
- Request custom drone shoot assignments from creators.

### 🧑‍💻 Admin Dashboard

- View, manage, and suspend users.
- Review all uploaded content.
- Monitor and approve payment slips manually.
- Oversee transaction history and platform analytics.
- Flag and remove inappropriate or unauthorized media.
- Manage platform settings, licenses, categories, and tags.

---

## 💳 Phase 1: Manual Bank Transfer System

SkyVault’s initial release uses a **manual payment system**:

1. Buyer selects drone content and chooses **"Bank Transfer"** at checkout.
2. Creator’s bank details are shown.
3. Buyer uploads the **payment slip**.
4. Creator manually verifies and **approves the order**.
5. Buyer gets access to **high-resolution download**.

---

## 🧱 Tech Stack

| Layer        | Technology                         |
|--------------|-------------------------------------|
| **Frontend** | Vite + React + Tailwind + ShadCN UI |
| **Backend**  | Node.js + Express                   |
| **Database** | MongoDB                             |
| **Auth**     | JWT-based with Role Management      |
| **Storage**  | Cloudinary (or S3-compatible) for media |
| **Hosting**  | Render / Railway / Vercel (planned) |

---

## 🔐 Role-Based Access Control

Implemented on both **frontend routing** and **backend API**:

- `buyer` → Content marketplace, purchase flow.
- `creator` → Upload & manage media, view orders.
- `admin` → Full access to dashboards and moderation tools.

---