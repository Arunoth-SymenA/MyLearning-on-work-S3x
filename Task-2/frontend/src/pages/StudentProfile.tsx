import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_STUDENT_BY_EMAIL, GET_MARKS_BY_STUDENT, DOWNLOAD_STUDENT_MARKS_EXCEL } from '../graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import { User, Mail, GraduationCap, BookOpen, Calendar, Award, Download } from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  const { data: studentData, loading: studentLoading } = useQuery(GET_STUDENT_BY_EMAIL, {
    variables: { email: user?.email || '' }
  });

  const { data: marksData, loading: marksLoading } = useQuery(GET_MARKS_BY_STUDENT, {
    variables: { studentId: studentData?.studentByEmail?._id || '' },
    skip: !studentData?.studentByEmail?._id
  });

  const { data: downloadData, loading: downloadLoading, refetch: refetchDownload } = useQuery(DOWNLOAD_STUDENT_MARKS_EXCEL, {
    variables: { studentId: studentData?.studentByEmail?._id || '' },
    skip: !studentData?.studentByEmail?._id
  });

  const handleDownloadMarks = async () => {
    try {
      if (studentData?.studentByEmail?._id) {
        await refetchDownload({ studentId: studentData.studentByEmail._id });
        if (downloadData?.downloadStudentMarksExcel) {
          const buffer = Buffer.from(downloadData.downloadStudentMarksExcel, 'base64');
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${studentData.studentByEmail.name}_marks.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error downloading marks:', error);
    }
  };

  if (studentLoading || marksLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const student = studentData?.studentByEmail;
  const marks = marksData?.marksByStudent || [];

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h1>
          <p className="text-gray-600">The student profile could not be found.</p>
        </div>
      </Layout>
    );
  }

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-600">View your academic information and performance</p>
          </div>
          <button
            onClick={handleDownloadMarks}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Marks
          </button>
        </div>

        {/* Student Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg text-gray-900">{student.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-lg text-gray-900">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Student ID</p>
                <p className="text-lg text-gray-900">{student.studentId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Enrolled Since</p>
                <p className="text-lg text-gray-900">
                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Academic Performance */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h2>
          
          {marks.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 text-sm italic mb-3">No marks recorded yet</p>
              <button
                onClick={handleDownloadMarks}
                className="flex items-center mx-auto px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
              >
                <Download className="w-3 h-3 mr-1" />
                Download Template
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {marks.length > 0 
                      ? Math.round((marks.reduce((sum: number, mark: any) => sum + (mark.marks / mark.maxMarks), 0) / marks.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-blue-600">Average Score</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">
                    {new Set(marks.map((mark: any) => mark.subject)).size}
                  </p>
                  <p className="text-sm text-green-600">Subjects</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{marks.length}</p>
                  <p className="text-sm text-purple-600">Total Marks</p>
                </div>
              </div>

              {/* Subject-wise Performance */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Subject-wise Performance</h3>
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const subjectMarks = marks.filter((mark: any) => mark.subject === subject);
                    if (subjectMarks.length === 0) return null;

                    const averageScore = subjectMarks.reduce((sum: number, mark: any) => sum + (mark.marks / mark.maxMarks), 0) / subjectMarks.length;
                    
                    return (
                      <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{subject}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {Math.round(averageScore * 100)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            {subjectMarks.length} entry{subjectMarks.length > 1 ? 'ies' : 'y'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Marks */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Marks</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marks.slice(0, 5).map((mark: any) => (
                        <tr key={mark._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.subject}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {mark.marks}/{mark.maxMarks}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {((mark.marks / mark.maxMarks) * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {mark.semester}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default StudentProfile;
