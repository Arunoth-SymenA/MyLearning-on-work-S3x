import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit, Trash2, Search, Download, Users } from 'lucide-react';
import { GET_MARKS, GET_STUDENTS, DOWNLOAD_MARKS_EXCEL } from '../graphql/queries';
import { ADD_MARK, UPDATE_MARK, DELETE_MARK } from '../graphql/mutations';
import { Mark, Student } from '../types';

const Marks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    marks: '',
    maxMarks: '',
    semester: '',
    academicYear: ''
  });

  const [bulkFormData, setBulkFormData] = useState({
    subject: '',
    maxMarks: '',
    semester: '',
    academicYear: '',
    studentMarks: [] as Array<{ studentId: string; marks: string; studentName: string }>
  });

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];

  // GraphQL queries and mutations
  const { data: marksData, loading: marksLoading, error: marksError, refetch: refetchMarks } = useQuery(GET_MARKS);
  const { data: studentsData, loading: studentsLoading, error: studentsError } = useQuery(GET_STUDENTS);
  const [addMark] = useMutation(ADD_MARK);
  const [updateMark] = useMutation(UPDATE_MARK);
  const [deleteMark] = useMutation(DELETE_MARK);

  const marks = marksData?.marks || [];
  const students = studentsData?.students || [];
  const loading = marksLoading || studentsLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const markData = {
        ...formData,
        marks: parseInt(formData.marks),
        maxMarks: parseInt(formData.maxMarks)
      };

      if (editingMark) {
        await updateMark({
          variables: {
            id: editingMark._id,
            input: markData
          }
        });
      } else {
        await addMark({
          variables: {
            input: markData
          }
        });
      }
      
      setFormData({
        studentId: '',
        subject: '',
        marks: '',
        maxMarks: '',
        semester: '',
        academicYear: ''
      });
      setShowAddForm(false);
      setEditingMark(null);
      refetchMarks();
    } catch (error: any) {
      console.error('Error saving mark:', error);
      alert(error.message || 'Error saving mark');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const marksToAdd = bulkFormData.studentMarks
        .filter(item => item.marks.trim() !== '')
        .map(item => ({
          studentId: item.studentId,
          subject: bulkFormData.subject,
          marks: parseInt(item.marks),
          maxMarks: parseInt(bulkFormData.maxMarks),
          semester: bulkFormData.semester,
          academicYear: bulkFormData.academicYear
        }));

      if (marksToAdd.length === 0) {
        alert('Please enter marks for at least one student');
        return;
      }

      // Add marks one by one using GraphQL mutations
      for (const markData of marksToAdd) {
        await addMark({
          variables: {
            input: markData
          }
        });
      }
      
      setBulkFormData({
        subject: '',
        maxMarks: '',
        semester: '',
        academicYear: '',
        studentMarks: []
      });
      setShowBulkForm(false);
      refetchMarks();
      alert(`Successfully added marks for ${marksToAdd.length} students`);
    } catch (error: any) {
      console.error('Error saving bulk marks:', error);
      alert(error.message || 'Error saving marks');
    }
  };

  const handleDelete = async (markId: string) => {
    if (window.confirm('Are you sure you want to delete this mark?')) {
      try {
        await deleteMark({
          variables: { id: markId }
        });
        refetchMarks();
      } catch (error) {
        console.error('Error deleting mark:', error);
      }
    }
  };

  const handleEdit = (mark: Mark) => {
    setEditingMark(mark);
    setFormData({
      studentId: mark.studentId,
      subject: mark.subject,
      marks: mark.marks.toString(),
      maxMarks: mark.maxMarks.toString(),
      semester: mark.semester,
      academicYear: mark.academicYear
    });
    setShowAddForm(true);
  };

  const handleDownload = async () => {
    try {
      // For GraphQL, we'll need to handle the base64 string response
      // This will be updated when we implement the download functionality
      alert('Download functionality will be implemented with GraphQL');
    } catch (error) {
      console.error('Error downloading marks:', error);
    }
  };

  const filteredMarks = marks.filter((mark: Mark) => {
    const student = students.find((s: Student) => s._id === mark.studentId);
    return (
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.semester.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const initializeBulkForm = () => {
    setBulkFormData({
      subject: '',
      maxMarks: '',
      semester: '',
      academicYear: '',
      studentMarks: students.map((student: Student) => ({
        studentId: student._id,
        marks: '',
        studentName: student.name
      }))
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (marksError || studentsError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            Error loading data: {marksError?.message || studentsError?.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marks Management</h1>
            <p className="text-gray-600">Manage student marks and grades</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={handleDownload} variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
            <Button 
              onClick={() => {
                initializeBulkForm();
                setShowBulkForm(true);
              }} 
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <Users className="mr-2 h-4 w-4" />
              Bulk Add Marks
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Single Mark
            </Button>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search marks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {showBulkForm && (
          <Card title="Bulk Add Marks">
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={bulkFormData.subject}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, subject: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Max Marks"
                  type="number"
                  value={bulkFormData.maxMarks}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, maxMarks: e.target.value })}
                  required
                />
                
                <Input
                  label="Semester"
                  value={bulkFormData.semester}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, semester: e.target.value })}
                  required
                />
                
                <Input
                  label="Academic Year"
                  value={bulkFormData.academicYear}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, academicYear: e.target.value })}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Marks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bulkFormData.studentMarks.map((item, index) => (
                    <div key={item.studentId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {item.studentName}
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter marks"
                          value={item.marks}
                          onChange={(e) => {
                            const newStudentMarks = [...bulkFormData.studentMarks];
                            newStudentMarks[index].marks = e.target.value;
                            setBulkFormData({ ...bulkFormData, studentMarks: newStudentMarks });
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add All Marks
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBulkForm(false);
                    setBulkFormData({
                      subject: '',
                      maxMarks: '',
                      semester: '',
                      academicYear: '',
                      studentMarks: []
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {showAddForm && (
          <Card title={editingMark ? 'Edit Mark' : 'Add New Mark'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student: Student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Marks"
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  required
                />
                
                <Input
                  label="Max Marks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  required
                />
                
                <Input
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  required
                />
                
                <Input
                  label="Academic Year"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">
                  {editingMark ? 'Update Mark' : 'Add Mark'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMark(null);
                    setFormData({
                      studentId: '',
                      subject: '',
                      marks: '',
                      maxMarks: '',
                      semester: '',
                      academicYear: ''
                    });
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
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMarks.map((mark: Mark) => {
                  const student = students.find((s: Student) => s._id === mark.studentId);
                  return (
                    <tr key={mark._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student?.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.marks}/{mark.maxMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((mark.marks / mark.maxMarks) * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mark.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(mark)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mark._id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Marks;
