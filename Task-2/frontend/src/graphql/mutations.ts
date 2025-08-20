import { gql } from 'graphql-tag';

// Authentication mutations
export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        _id
        name
        email
        role
      }
    }
  }
`;

// User mutations
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: RegisterInput!) {
    updateUser(id: $id, input: $input) {
      _id
      name
      email
      role
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Mark mutations
export const ADD_MARK = gql`
  mutation AddMark($input: AddMarkInput!) {
    addMark(input: $input) {
      _id
      studentId
      subject
      marks
      maxMarks
      semester
      academicYear
      createdAt
    }
  }
`;

export const UPDATE_MARK = gql`
  mutation UpdateMark($id: ID!, $input: UpdateMarkInput!) {
    updateMark(id: $id, input: $input) {
      _id
      studentId
      subject
      marks
      maxMarks
      semester
      academicYear
      updatedAt
    }
  }
`;

export const DELETE_MARK = gql`
  mutation DeleteMark($id: ID!) {
    deleteMark(id: $id)
  }
`;

// Student mutations
export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      _id
      name
      email
      studentId
      createdAt
    }
  }
`;

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      _id
      name
      email
      studentId
      updatedAt
    }
  }
`;

export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id)
  }
`;

// Teacher mutations
export const CREATE_TEACHER = gql`
  mutation CreateTeacher($input: RegisterInput!) {
    createTeacher(input: $input) {
      _id
      name
      email
      subject
      createdAt
    }
  }
`;

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: ID!, $input: RegisterInput!) {
    updateTeacher(id: $id, input: $input) {
      _id
      name
      email
      subject
      updatedAt
    }
  }
`;

export const DELETE_TEACHER = gql`
  mutation DeleteTeacher($id: ID!) {
    deleteTeacher(id: $id)
  }
`;
