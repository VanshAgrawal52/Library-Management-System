# Document Request Management System

A comprehensive full-stack web application for managing document requests in an academic library environment. This system enables users to submit document requests and allows administrators to process, approve, or reject them with automated email notifications.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Features
- User registration and authentication with JWT
- Submit document requests with detailed metadata
- Track request status (Pending, Processing, Accepted, Rejected)
- Download approved documents
- View personal request history
- Analytics dashboard for request insights
- Digital library access
- Password recovery

### Admin Features
- Admin panel for managing all document requests
- Update request status (Processing, Accepted, Rejected)
- Upload PDF documents for approved requests
- View comprehensive analytics
- Email notifications for status updates
- User management
- Generate reports

### System Features
- Secure authentication with access and refresh tokens
- GridFS for efficient large file storage (PDF documents)
- Automated email notifications using Nodemailer
- Real-time request tracking
- Responsive UI built with React and Tailwind CSS
- Data visualization with charts (Recharts)
- Export functionality (Excel, PDF)
- Protected routes and role-based access control

## Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Recharts** - Data visualization library
- **React Chart.js 2** - Chart components
- **Lucide React** - Icon library
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **xlsx** - Excel file handling
- **jwt-decode** - JWT token decoding
- **React DatePicker** - Date selection component

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **GridFS** - Large file storage
- **Nodemailer** - Email service
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
DC Project/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── gridfs.js          # GridFS configuration
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── libraryController.js
│   │   ├── mailControllers.js
│   │   └── requestController.js
│   ├── middlewares/
│   │   └── auth.js            # JWT verification middleware
│   ├── models/
│   │   ├── library.js
│   │   ├── request.js
│   │   └── user.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── libraryRoutes.js
│   │   └── requestRoutes.js
│   ├── utils/
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── hideRoutes.jsx
│   │   │   └── navbar.jsx
│   │   ├── pages/
│   │   │   ├── adminPanel.jsx
│   │   │   ├── analyticsPage.jsx
│   │   │   ├── dashboard.jsx
│   │   │   ├── forgetPasswordPage.jsx
│   │   │   ├── home.jsx
│   │   │   ├── library.jsx
│   │   │   ├── login.jsx
│   │   │   ├── register.jsx
│   │   │   └── user.jsx
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dc-project.git
cd dc-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Client Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Setting up Email Service

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for the application
4. Use the generated app password in `EMAIL_PASS`

#### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and replace `MONGO_URI`

**Option 2: Local MongoDB**
```bash
# Install MongoDB locally and use:
MONGO_URI=mongodb://localhost:27017/document-request-system
```

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

The production-ready files will be in the `dist` folder.

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| POST | `/refresh` | Refresh access token | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |

### Request Routes (`/api/requests`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/submit` | Submit new document request | Yes |
| GET | `/my-requests` | Get user's requests | Yes |
| GET | `/all` | Get all requests (Admin) | Yes (Admin) |
| PUT | `/update/:requestId` | Update request info | Yes |
| PUT | `/status/:id` | Update request status (Admin) | Yes (Admin) |
| GET | `/file/:fileId` | Download document file | Yes |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes (Admin) |
| PUT | `/users/:id/role` | Update user role | Yes (Admin) |
| DELETE | `/users/:id` | Delete user | Yes (Admin) |

### Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get system statistics | Yes (Admin) |
| GET | `/user-stats` | Get user-specific stats | Yes |

### Library Routes (`/api/library`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get library documents | Yes |
| POST | `/upload` | Upload library document | Yes (Admin) |
| DELETE | `/:id` | Delete library document | Yes (Admin) |

## Usage

### For Users

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your details (name, email, roll number, department)
   - Submit the registration form

2. **Login**
   - Use your registered email and password
   - You'll be redirected to your dashboard

3. **Submit a Document Request**
   - Go to the dashboard
   - Fill in the document details:
     - Document Title
     - Authors
     - Publication Name
     - Publication Year
     - Volume Number
     - Issue Number (optional)
     - Page Range (optional)
     - Publisher
     - Source URL
   - Submit the request

4. **Track Your Requests**
   - View all your requests on the user page
   - Monitor status updates (Pending → Processing → Accepted/Rejected)
   - Download approved documents

5. **Access Library**
   - Browse available documents in the library section
   - Download documents directly

### For Administrators

1. **Access Admin Panel**
   - Login with admin credentials
   - Navigate to the admin panel

2. **Manage Requests**
   - View all pending requests
   - Update request status:
     - **Processing**: Request is being worked on
     - **Accepted**: Upload PDF and approve
     - **Rejected**: Select rejection reason
   - Upload documents for approved requests

3. **View Analytics**
   - Monitor system usage statistics
   - View request trends
   - Generate reports

4. **Manage Library**
   - Upload new documents to the library
   - Delete outdated documents
   - Organize library content

5. **User Management**
   - View all registered users
   - Update user roles
   - Manage user permissions

## Email Notifications

The system automatically sends email notifications for:

- **New Request Submission**: Notifies all administrators
- **Status Updates**: Notifies the requesting user when status changes
- **Document Approval**: Includes download information
- **Request Rejection**: Includes reason for rejection
- **Password Reset**: Sends reset link to user

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication with refresh tokens
- HTTP-only cookies for token storage
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Protected routes with role-based access control
- Secure file upload with validation

## Database Schema

### User Model
- Personal information (name, email, roll number, department)
- Authentication credentials (hashed password)
- Role (user/admin)
- Embedded requests array
- Timestamps

### Request Model
- Document metadata (title, authors, publication details)
- Request status (pending, processing, accepted, rejected)
- Rejection reason (if applicable)
- PDF file reference (GridFS)
- User reference (metaId)
- Timestamps

### Library Model
- Document information
- File reference
- Upload metadata
- Timestamps

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file configuration
- Ensure port 5000 is not in use

**Frontend won't connect to backend:**
- Verify `CLIENT_URL` in backend `.env`
- Check CORS configuration
- Ensure backend is running

**Email notifications not working:**
- Verify Gmail app password is correct
- Check 2FA is enabled on Google account
- Review email configuration in `.env`

**File upload fails:**
- Check MongoDB GridFS configuration
- Verify file size limits
- Ensure proper MIME type

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built for IIT Jodhpur Central Library
- Inspired by academic document management needs
- Thanks to all contributors and users

## Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**Developed with care for academic excellence**
