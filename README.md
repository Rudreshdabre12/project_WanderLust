# 🌍 WanderLust - Travel & Accommodation Platform

A modern, full-stack travel and accommodation booking platform built with Next.js, featuring AI-powered travel recommendations, real-time booking system, and seamless user experience.

## ✨ Features

### 🏠 **Accommodation Management**
- Browse and search travel accommodations
- Advanced filtering by location, price, and amenities
- Real-time availability and pricing
- High-quality image galleries with Cloudinary integration

### 🤖 **AI-Powered Travel Assistant**
- **Google Gemini Integration** for intelligent travel recommendations
- Natural language query processing
- Personalized destination suggestions
- Budget-aware recommendations

### 👤 **User Authentication & Management**
- Secure user registration and login
- JWT-based authentication
- User profile management
- Booking history and management

### 💳 **Payment Integration**
- **Razorpay** payment gateway integration
- Secure payment processing
- Booking confirmation system
- Transaction verification

### 🗺️ **Location Services**
- **Google Maps** integration for location autocomplete
- Geocoding services for address validation
- Interactive maps for property locations

### ⚡ **Performance & Caching**
- **Redis caching** for improved performance
- Optimized database queries
- Fast loading times with Next.js optimization

### 📱 **Modern UI/UX**
- Responsive design for all devices
- Beautiful animations with Framer Motion
- Intuitive user interface
- Dark/light theme support

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Spinners** - Loading indicators

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### **External Services**
- **Google Gemini AI** - Travel recommendations
- **Google Maps API** - Location services
- **Cloudinary** - Image storage and optimization
- **Razorpay** - Payment processing
- **Upstash Redis** - Caching layer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Cloud account (for Maps API)
- Google AI Studio account (for Gemini API)
- Cloudinary account
- Razorpay account
- Upstash Redis account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project_WanderLust
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Database
   MONGODB_URL=your_mongodb_connection_string
   
   # Authentication
   TOKEN_SECRET=your_jwt_secret_key
   NEXT_PUBLIC_TOKEN_SECRET=your_public_jwt_secret
   
   # Google Services
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_public_google_maps_key
   
   # AI Integration
   GEMINI_API_KEY=your_gemini_api_key
   
   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Payment Gateway
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_razorpay_key_id
   
   # Redis Cache
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   
   # Environment
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 API Endpoints

### **Authentication**
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/logout` - User logout
- `GET /api/users/getTokenData` - Get user data from token

### **Listings**
- `GET /api/listings/home` - Get all listings (with caching)
- `GET /api/listings/[id]` - Get single listing
- `POST /api/listings/uploadPhoto` - Upload listing images
- `PUT /api/listings/edit` - Edit listing

### **AI Assistant**
- `POST /api/ai/query` - AI-powered travel recommendations

### **Payments**
- `POST /api/payment` - Create payment order
- `POST /api/payment/verify` - Verify payment

### **Cache Management**
- `GET /api/cache` - Get cache status
- `DELETE /api/cache` - Clear cache

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── bookings/          # Booking management pages
│   ├── home/              # Main listing page
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── new/               # Add new listing
│   └── show/[id]/         # Listing details
├── components/            # Reusable components
├── dbConfig/             # Database configuration
├── lib/                  # Utility libraries
├── models/               # MongoDB models
├── cloudConfig/          # Cloudinary configuration
└── helper/               # Helper functions
```

## 🎯 Key Features Explained

### **AI Travel Assistant**
The application uses Google Gemini AI to provide intelligent travel recommendations. Users can ask natural language queries like:
- "Peaceful mountain retreat under $1500"
- "Cultural city experience with good food"
- "Beach destinations for families"

### **Smart Caching**
Redis caching is implemented to improve performance:
- Listings are cached for 30 minutes in production
- Single listings cached for 1 hour
- Cache invalidation on updates

### **Secure Payments**
Razorpay integration ensures secure payment processing:
- Order creation with proper validation
- Webhook verification for payment confirmation
- Transaction history tracking

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Other Platforms**
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Environment variable protection
- Secure API endpoints
- Input validation and sanitization
