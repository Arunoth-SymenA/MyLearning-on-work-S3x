import { gql } from 'graphql-tag';

// Authentication queries
export const GET_ME = gql`
  query GetMe {
    me {
      _id
      name
      email
      role
    }
  }
`;

// Student queries
export const GET_STUDENTS = gql`
  query GetStudents {
    students {
      _id
      name
      email
      studentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_STUDENT_BY_EMAIL = gql`
  query GetStudentByEmail($email: String!) {
    studentByEmail(email: $email) {
      _id
      name
      email
      studentId
      createdAt
      updatedAt
    }
  }
`;

// Teacher queries
export const GET_TEACHERS = gql`
  query GetTeachers {
    teachers {
      _id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

// Marks queries
export const GET_MARKS = gql`
  query GetMarks {
    marks {
      _id
      studentId
      subject
      marks
      maxMarks
      semester
      academicYear
      createdAt
      updatedAt
    }
  }
`;

export const GET_MARKS_BY_STUDENT = gql`
  query GetMarksByStudent($studentId: ID!) {
    marksByStudent(studentId: $studentId) {
      _id
      studentId
      subject
      marks
      maxMarks
      semester
      academicYear
      createdAt
      updatedAt
    }
  }
`;

// Dashboard queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalStudents
      totalTeachers
      totalMarks
      averageMarks
    }
  }
`;

// Download queries
export const DOWNLOAD_MARKS_EXCEL = gql`
  query DownloadMarksExcel {
    downloadMarksExcel
  }
`;

export const DOWNLOAD_STUDENT_MARKS_EXCEL = gql`
  query DownloadStudentMarksExcel($studentId: ID!) {
    downloadStudentMarksExcel(studentId: $studentId)
  }
`;
