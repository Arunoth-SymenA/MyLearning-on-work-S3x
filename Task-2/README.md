# Student Marks Management System

A comprehensive full-stack MERN application for managing student records and marks with role-based authentication and authorization.

## 🚀 Features

### Authentication & Authorization
- Role-based authentication (Admin, Teacher, Student)
- JWT token-based security
- Secure login system
- Role-based routing and access control

### Admin Module
- Add new students with name, email, and unique ID
- View lists of all students and teachers
- Dashboard with statistics (total students, teachers, marks)
- Complete CRUD operations for student management

### Teacher Module
- Add, edit, and delete marks for students
- View statistics (students handled, marks entries)
- Download all student marks as Excel file
- Manage marks for 5 subjects (Mathematics, Science, English, History, Geography)

### Student Module
- Login using email provided by Admin
- View personal marks only (like a report card)
- No edit/delete access - read-only view

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database (using MongoDB client, not Mongoose)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **xlsx** - Excel file generation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
student-marks-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── marksController.ts
│   │   │   └── dashboardController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── students.ts
│   │   │   ├── marks.ts
│   │   │   └── dashboard.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-marks-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cd ../backend
   cp env.example .env
   ```

4. **Configure Environment Variables**
   Edit `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student_marks_db
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

5. **Start the application**
   ```bash
   # From root directory
   npm run dev
   ```

   Or start separately:
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # Start frontend (in new terminal)
   cd frontend
   npm start
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students (Admin only)
- `POST /api/students` - Add new student (Admin only)
- `GET /api/students/:id` - Get student by ID (Admin, Teacher)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Marks
- `GET /api/marks` - Get all marks (Admin, Teacher)
- `POST /api/marks` - Add new mark (Teacher only)
- `GET /api/marks/student/:studentId` - Get marks by student (Admin, Teacher, Student)
- `PUT /api/marks/:id` - Update mark (Teacher only)
- `DELETE /api/marks/:id` - Delete mark (Teacher only)
- `GET /api/marks/download` - Download marks as Excel (Teacher only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)
- `GET /api/dashboard/teachers` - Get all teachers (Admin only)
- `GET /api/dashboard/teacher/:teacherId/stats` - Get teacher statistics (Admin, Teacher)

## 👥 User Roles

### Admin
- Full access to all features
- Can manage students and teachers
- View dashboard statistics
- Access to all data

### Teacher
- Can manage marks for students
- View student information
- Download marks as Excel
- Limited to their own marks entries

### Student
- Can only view their own marks
- Read-only access
- No edit/delete permissions

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS protection
- Helmet security headers

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (admin/teacher/student),
  createdAt: Date,
  updatedAt: Date
}
```

### Students Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  studentId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Marks Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  subject: String,
  marks: Number,
  maxMarks: Number,
  semester: String,
  academicYear: String,
  teacherId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Features

- Modern, responsive design
- Tailwind CSS styling
- Role-based navigation
- Search functionality
- Excel export capability
- Loading states
- Error handling
- Toast notifications

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code:
   ```bash
   cd backend
   npm run build
   ```

2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Vercel, AWS, etc.)

### Frontend Deployment
1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` folder to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
