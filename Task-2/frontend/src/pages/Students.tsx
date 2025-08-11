import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { GET_STUDENTS, DOWNLOAD_STUDENT_MARKS_EXCEL, GET_MARKS_BY_STUDENT } from '../graphql/queries';
import { CREATE_STUDENT, UPDATE_STUDENT, DELETE_STUDENT } from '../graphql/mutations';
import { Student } from '../types';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: ''
  });

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_STUDENTS);
  const { refetch: refetchStudentDownload } = useQuery(DOWNLOAD_STUDENT_MARKS_EXCEL, { skip: true });
  const { data: marksData } = useQuery(GET_MARKS_BY_STUDENT, {
    variables: { studentId: selectedStudentId || '' },
    skip: !selectedStudentId,
  });
  const [createStudent] = useMutation(CREATE_STUDENT);
  const [updateStudent] = useMutation(UPDATE_STUDENT);
  const [deleteStudent] = useMutation(DELETE_STUDENT);

  const students = data?.students || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent({
          variables: {
            id: editingStudent._id,
            input: formData
          }
        });
      } else {
        await createStudent({
          variables: {
            input: formData
          }
        });
      }
      setFormData({ name: '', email: '', studentId: '' });
      setShowAddForm(false);
      setEditingStudent(null);
      refetch();
    } catch (error: any) {
      console.error('Error saving student:', error);
      alert(error.message || 'Error saving student');
    }
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent({
          variables: { id: studentId }
        });
        refetch();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleDownload = async (studentId: string) => {
    try {
      const { data: download } = await refetchStudentDownload({ studentId });
      const base64 = download?.downloadStudentMarksExcel;
      if (!base64) return;
      const buffer = Buffer.from(base64, 'base64');
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_marks.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to download');
    }
  };

  const handleViewMarks = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentId: student.studentId
    });
    setShowAddForm(true);
  };

  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error loading students: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600">Manage student records</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {showAddForm && (
          <Card title={editingStudent ? 'Edit Student' : 'Add New Student'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStudent(null);
                    setFormData({ name: '', email: '', studentId: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student: Student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewMarks(student._id)}
                        >
                          View Marks
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(student._id)}
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(student._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedStudentId && (
          <Card title="Selected Student Marks">
            {!marksData ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(marksData?.marksByStudent || []).map((m: any) => (
                      <tr key={m._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.marks}/{m.maxMarks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Students;
