# 🚀 PHAMSAG Backend

Past Questions & Academic Resource Platform for Pharmacy Students

## 📋 Features

- 🔐 **JWT Authentication** with access/refresh tokens
- 👥 **Role-based access control** (USER, ADMIN)
- 📚 **Course management** with automatic seeding
- 📄 **Past questions** upload with Cloudinary integration
- 🔍 **Advanced filtering & search** by level, semester, course, year
- 📊 **Analytics & statistics** for courses and past questions
- 🎥 **YouTube video search** for pharmacy content
- 📈 **View & download tracking**
- 🛡️ **Enterprise-grade security** with Helmet, CORS, rate limiting
- 📝 **Comprehensive logging** with Pino
- 🚦 **Production-ready error handling**
- 🧪 **Postman-tested API endpoints**

## 🏗️ Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary + Multer
- **Validation**: express-validator
- **Logging**: Pino
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Start

### 1. Clone & Setup

```bash
# Clone repository
git clone <repository-url>
cd phamsag-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env