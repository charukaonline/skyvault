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

- **Upload Dashboard**: Comprehensive upload system with AWS S3 integration
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

- **Private AWS S3 Integration**: Secure cloud storage for all media files with presigned URL access
- **Multi-file Upload**: Support for videos (MP4, MOV) and images (JPG, PNG) with direct private S3 upload
- **YouTube Integration**: Add preview links for enhanced content showcase (public previews)
- **Metadata Management**: Comprehensive tagging, categorization, and location data
- **License Configuration**: Flexible licensing options with custom pricing
- **Technical Details**: Resolution, duration, drone model, and shooting conditions
- **Progress Tracking**: Real-time upload progress with secure S3 file management
- **Content Status**: Approval workflow with pending/approved/rejected states
- **Private Access Control**: Secure presigned URLs for authorized access only

### Supported Formats

- **Videos**: MP4, MOV (up to 100MB per file) stored privately on AWS S3
- **Images**: JPG, PNG (up to 100MB per file) stored privately on AWS S3
- **Resolutions**: 4K, 2K, HD, 720p with secure S3 metadata storage
- **Previews**: YouTube video links for public showcasing + private S3 presigned URLs for authorized users

### AWS S3 Private Storage Benefits

- **Enhanced Security**: All files stored privately with no public access
- **Presigned URLs**: Temporary access URLs for authorized users only
- **Access Control**: Role-based access (creators see own content, buyers see purchased content)
- **Scalable**: Unlimited storage capacity with enterprise-grade security
- **Cost-Effective**: Pay only for storage and requests used
- **Reliable**: 99.999999999% (11 9's) durability
- **Secure Downloads**: Time-limited download URLs for purchased content

### Security Architecture

- **Private by Default**: All uploaded content is stored privately on S3
- **Presigned URL Access**: Temporary URLs generated for authorized users (15min-2hr expiration)
- **Role-Based Security**: Creators access own content, buyers access purchased content, admins access all
- **Purchase Verification**: Access control integrated with purchase tracking system
- **Audit Trail**: All access attempts logged for security monitoring

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
| **Storage**  | AWS S3 (Images & Videos)            |
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
3. Start development server: `npm run dev`

### Backend Setup

1. Set up AWS S3 bucket and configure IAM user with S3 permissions
2. Create `.env` file with AWS credentials:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```
3. Configure CORS policy on S3 bucket for frontend access

### AWS S3 Configuration

1. Create an S3 bucket with public read access for content delivery
2. Set up IAM user with S3 permissions (PutObject, GetObject, DeleteObject)
3. Configure bucket CORS policy for web access
4. Set up folder structure: `skyvault/content`
5. Enable versioning and lifecycle policies as needed
6. Configure CloudFront CDN for optimal performance (optional)

### Environment Variables

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```
