import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    role: UserRole!
    createdAt: String
    updatedAt: String
  }

  type Student {
    _id: ID!
    name: String!
    email: String!
    studentId: String!
    createdAt: String
    updatedAt: String
  }

  type Teacher {
    _id: ID!
    name: String!
    email: String!
    role: UserRole
    subject: String
    createdAt: String
    updatedAt: String
  }

  type Mark {
    _id: ID!
    studentId: ID!
    student: Student
    teacherId: ID
    subject: String!
    marks: Int!
    maxMarks: Int!
    semester: String!
    academicYear: String!
    createdAt: String
    updatedAt: String
  }

  type DashboardStats {
    totalStudents: Int!
    totalTeachers: Int!
    totalMarks: Int!
    averageMarks: Float
  }

  type StudentMarks {
    student: Student!
    marks: [Mark!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum UserRole {
    admin
    teacher
    student
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String
    role: UserRole
  }

  input CreateStudentInput {
    name: String!
    email: String!
    studentId: String!
  }

  input UpdateStudentInput {
    name: String
    email: String
    studentId: String
  }

  input AddMarkInput {
    studentId: ID!
    subject: String!
    marks: Int!
    maxMarks: Int!
    semester: String!
    academicYear: String!
  }

  input UpdateMarkInput {
    subject: String
    marks: Int
    maxMarks: Int
    semester: String
    academicYear: String
  }

  type Query {
    # Auth queries
    me: User
    
    # User queries
    users: [User!]!
    user(id: ID!): User
    
    # Student queries
    students: [Student!]!
    student(id: ID!): Student
    studentByEmail(email: String!): Student
    
    # Teacher queries
    teachers: [Teacher!]!
    teacher(id: ID!): Teacher
    
    # Mark queries
    marks: [Mark!]!
    mark(id: ID!): Mark
    marksByStudent(studentId: ID!): [Mark!]!
    
    # Dashboard queries
    dashboardStats: DashboardStats!
    
    # Download queries
    downloadMarksExcel: String!
    downloadStudentMarksExcel(studentId: ID!): String!
  }

  type Mutation {
    # Auth mutations
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    
    # User mutations
    updateUser(id: ID!, input: RegisterInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Student mutations
    createStudent(input: CreateStudentInput!): Student!
    updateStudent(id: ID!, input: UpdateStudentInput!): Student!
    deleteStudent(id: ID!): Boolean!
    
    # Teacher mutations
    createTeacher(input: RegisterInput!): Teacher!
    updateTeacher(id: ID!, input: RegisterInput!): Teacher!
    deleteTeacher(id: ID!): Boolean!
    
    # Mark mutations
    addMark(input: AddMarkInput!): Mark!
    updateMark(id: ID!, input: UpdateMarkInput!): Mark!
    deleteMark(id: ID!): Boolean!
  }
`;

