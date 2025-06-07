# 🌌 SkyVault

**SkyVault** is a content licensing marketplace for drone content creators to upload, license, and sell high-quality aerial videos and photos to marketers, real estate agents, tourism boards, media companies, and more.

---

## 🚀 Platform Overview

SkyVault bridges the gap between drone content creators and businesses looking for captivating aerial footage. It supports 4K/HD media licensing, role-based access, secure transactions (manual bank transfer in Phase 1), and a powerful admin dashboard for platform governance.

---

## 🧑‍💼 User Roles

| Role        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| **Buyer**   | Purchases and downloads licensed drone content.              |
| **Creator** | Uploads, licenses, and earns revenue from aerial footage.    |
| **Admin**   | Manages users, content, orders, and platform configurations. |

---

## 🔑 Core Features

### ✈️ For Creators

- **Upload Dashboard**: Comprehensive upload system with Cloudinary integration
- Upload high-resolution drone videos/photos (up to 4K) with drag-and-drop interface
- Add YouTube preview links for better content showcase
- Assign license types (e.g., royalty-free, limited use, exclusive)
- Set custom pricing and availability with detailed metadata
- **Content Management**: View, edit, and manage all uploaded content
- Track views, downloads, and engagement analytics
- Monitor earnings and download statistics
- Manage content status and approval workflow

### 🛍️ For Buyers

- Browse/search categorized drone footage (location, theme, resolution).
- Preview media in low-resolution with watermark protection.
- Filter content by resolution, date, category, and creator.
- Manually upload bank transfer slip for order processing.
- Download high-resolution licensed content upon approval.
- Request custom drone shoot assignments from creators.

### 🧑‍💻 Admin Dashboard

- View, manage, and suspend users.
- Review all uploaded content and approve/reject submissions.
- Monitor and approve payment slips manually.
- Oversee transaction history and platform analytics.
- Flag and remove inappropriate or unauthorized media.
- Manage platform settings, licenses, categories, and tags.

---

## 📤 Content Upload System

### Upload Features

- **Cloudinary Integration**: Secure cloud storage for all media files
- **Multi-file Upload**: Support for videos (MP4, MOV) and images (JPG, PNG)
- **YouTube Integration**: Add preview links for enhanced content showcase
- **Metadata Management**: Comprehensive tagging, categorization, and location data
- **License Configuration**: Flexible licensing options with custom pricing
- **Technical Details**: Resolution, duration, drone model, and shooting conditions
- **Progress Tracking**: Real-time upload progress with file management
- **Content Status**: Approval workflow with pending/approved/rejected states

### Supported Formats

- **Videos**: MP4, MOV (up to 100MB per file)
- **Images**: JPG, PNG (up to 100MB per file)
- **Resolutions**: 4K, 2K, HD, 720p
- **Previews**: YouTube video links for enhanced showcasing

---

## 💳 Phase 1: Manual Bank Transfer System

SkyVault's initial release uses a **manual payment system**:

1. Buyer selects drone content and chooses **"Bank Transfer"** at checkout.
2. Creator's bank details are shown.
3. Buyer uploads the **payment slip**.
4. Creator manually verifies and **approves the order**.
5. Buyer gets access to **high-resolution download**.

---

## 🧱 Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| **Frontend** | Vite + React + Tailwind + ShadCN UI |
| **Backend**  | Java Spring Boot                    |
| **Database** | MongoDB                             |
| **Storage**  | Cloudinary (Images & Videos)        |
| **Preview**  | YouTube Integration                 |

---

## 🔐 Role-Based Access Control

Implemented on both **frontend routing** and **backend API**:

- `buyer` → Content marketplace, purchase flow.
- `creator` → Upload & manage media, view orders, content dashboard.
- `admin` → Full access to dashboards and moderation tools.

---

## 🛠️ Setup Instructions

### Frontend Setup

1. Navigate to the client directory
2. Install dependencies: `npm install`
3. Create `.env` file with Cloudinary credentials:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```
4. Start development server: `npm run dev`

### Cloudinary Configuration

1. Create a Cloudinary account
2. Create an upload preset for unsigned uploads
3. Configure folder structure: `skyvault/content`
4. Set up auto-moderation and optimization rules

---
