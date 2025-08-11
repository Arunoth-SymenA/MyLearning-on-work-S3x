import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_STUDENT_BY_EMAIL, GET_MARKS_BY_STUDENT, DOWNLOAD_STUDENT_MARKS_EXCEL } from '../graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, BookOpen, Award, TrendingUp, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS, {
    skip: user?.role === 'student'
  });

  const { data: studentData, loading: studentLoading } = useQuery(GET_STUDENT_BY_EMAIL, {
    variables: { email: user?.email || '' },
    skip: user?.role !== 'student'
  });

  const { data: marksData, loading: marksLoading } = useQuery(GET_MARKS_BY_STUDENT, {
    variables: { studentId: studentData?.studentByEmail?._id || '' },
    skip: user?.role !== 'student' || !studentData?.studentByEmail?._id
  });

  const { data: downloadData, loading: downloadLoading, refetch: refetchDownload } = useQuery(DOWNLOAD_STUDENT_MARKS_EXCEL, {
    variables: { studentId: studentData?.studentByEmail?._id || '' },
    skip: user?.role !== 'student' || !studentData?.studentByEmail?._id
  });

  const handleDownloadStudentMarks = async (studentId: string) => {
    try {
      await refetchDownload({ studentId });
      if (downloadData?.downloadStudentMarksExcel) {
        const buffer = Buffer.from(downloadData.downloadStudentMarksExcel, 'base64');
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${studentData?.studentByEmail?.name || 'student'}_marks.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading student marks:', error);
    }
  };

  if (user?.role === 'student') {
    const student = studentData?.studentByEmail;
    const studentMarks = marksData?.marksByStudent || [];

    if (studentLoading || marksLoading) {
      return (
        <Layout>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {student?.name}!</p>
          </div>

          {/* Student Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {studentMarks.length > 0 ? new Set(studentMarks.map((mark: any) => mark.subject)).size : 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {studentMarks.length > 0 
                      ? Math.round((studentMarks.reduce((sum: number, mark: any) => sum + (mark.marks / mark.maxMarks), 0) / studentMarks.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Marks</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {studentMarks.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* My Marks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Marks</h2>
              {studentMarks.length > 0 && (
                <Button onClick={() => handleDownloadStudentMarks(student?._id || '')} className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Download My Marks
                </Button>
              )}
            </div>
            
            {studentMarks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No marks available yet.</p>
            ) : (
              <div>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentMarks.map((mark: any) => (
                        <tr key={mark._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mark.marks}/{mark.maxMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {((mark.marks / mark.maxMarks) * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {mark.semester}
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
      </Layout>
    );
  }

  // Admin/Teacher Dashboard
  if (statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const stats = statsData?.dashboardStats;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalTeachers || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Marks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalMarks || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Marks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.averageMarks || 0}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Actions</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="justify-center min-w-[220px]" onClick={() => window.location.assign('/students')}>
                View Students
              </Button>
              {user?.role !== 'admin' && (
                <Button className="justify-center min-w-[220px]" onClick={() => window.location.assign('/marks')}>
                  Manage Marks
                </Button>
              )}
              {user?.role === 'admin' && (
                <Button className="justify-center min-w-[220px]" onClick={() => window.location.assign('/teachers')}>
                  View Teachers
                </Button>
              )}
            </div>
          </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
