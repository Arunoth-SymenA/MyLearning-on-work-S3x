export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Mark {
  _id: string;
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  semester: string;
  academicYear: string;
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
  studentName?: string;
  studentEmail?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AddStudentRequest {
  name: string;
  email: string;
  studentId: string;
}

export interface AddMarkRequest {
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  semester: string;
  academicYear: string;
}

export interface UpdateMarkRequest {
  marks: number;
  maxMarks: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalMarks: number;
}

export interface TeacherStats {
  studentsHandled: number;
  marksEntries: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
