import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { Users, BookOpen, BarChart3, Download } from 'lucide-react';
import api from '../utils/api';
import { DashboardStats, TeacherStats, Mark, Student } from '../types';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [studentMarks, setStudentMarks] = useState<Mark[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin') {
          const response = await api.get('/dashboard/stats');
          setStats(response.data.stats);
        } else if (user?.role === 'teacher') {
          const response = await api.get(`/dashboard/teacher/${user._id}/stats`);
          setTeacherStats(response.data.stats);
        } else if (user?.role === 'student') {
          // Get student by email using the new API endpoint
          try {
            const studentResponse = await api.get(`/students/email/${encodeURIComponent(user.email)}`);
            const student = studentResponse.data.student;
            if (student) {
              setStudent(student);
              const marksResponse = await api.get(`/marks/student/${student._id}`);
              setStudentMarks(marksResponse.data.marks);
            }
          } catch (error) {
            console.error('Error fetching student data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleDownloadMarks = async () => {
    try {
      const response = await api.get('/marks/download', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_marks.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading marks:', error);
    }
  };

  const handleDownloadStudentMarks = async (studentId: string) => {
    try {
      const response = await api.get(`/marks/student/${studentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student?.name || 'student'}_marks.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading student marks:', error);
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' && 'Admin Dashboard'}
            {user?.role === 'teacher' && 'Teacher Dashboard'}
            {user?.role === 'student' && 'My Marks'}
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {user?.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Marks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMarks}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {user?.role === 'teacher' && teacherStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Students Handled</p>
                  <p className="text-2xl font-bold text-gray-900">{teacherStats.studentsHandled}</p>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Marks Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{teacherStats.marksEntries}</p>
                </div>
              </div>
            </Card>
            
            <div className="md:col-span-2">
              <Card title="Quick Actions">
                <div className="flex space-x-4">
                  <Button onClick={handleDownloadMarks} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Download All Marks
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {user?.role === 'student' && student && (
          <div className="space-y-6">
            <Card title="Student Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg text-gray-900">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Student ID</p>
                  <p className="text-lg text-gray-900">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{student.email}</p>
                </div>
              </div>
            </Card>

            <Card title="My Marks">
              {studentMarks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No marks available yet.</p>
              ) : (
                <div>
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleDownloadStudentMarks(student._id)} className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Download My Marks
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          Academic Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentMarks.map((mark) => (
                        <tr key={mark._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mark.academicYear}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
