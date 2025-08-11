import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Mark, Student } from '../types';
import Card from '../components/ui/Card';
import Layout from '../components/layout/Layout';
import { User, Mail, GraduationCap, BookOpen, Calendar, Award, Download } from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch student details
        const studentResponse = await api.get(`/students/email/${user.email}`);
        setStudent(studentResponse.data.student);
        
        // Fetch student marks
        const marksResponse = await api.get(`/marks/student/${studentResponse.data.student._id}`);
        setMarks(marksResponse.data.marks);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

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
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-600">
            Student information not found
          </div>
        </div>
      </Layout>
    );
  }

  const getSubjectMarks = (subject: string) => {
    return marks.filter(mark => mark.subject === subject);
  };

  const calculateAverage = (subjectMarks: Mark[]) => {
    if (subjectMarks.length === 0) return 0;
    const total = subjectMarks.reduce((sum, mark) => sum + mark.marks, 0);
    return Math.round((total / subjectMarks.length) * 100) / 100;
  };

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];

  const handleDownloadMarks = async () => {
    try {
      const response = await api.get(`/marks/student/${student._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${student.name}_marks.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading marks:', error);
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{student.name}</h2>
                <p className="text-gray-600 mb-4">{student.studentId}</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{student.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Academic Performance */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Academic Performance</h3>
              </div>

              <div className="space-y-6">
                {subjects.map((subject) => {
                  const subjectMarks = getSubjectMarks(subject);
                  const average = calculateAverage(subjectMarks);
                  
                  return (
                    <div key={subject} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{subject}</h4>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="font-semibold text-gray-900">{average}%</span>
                        </div>
                      </div>
                      
                      {subjectMarks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {subjectMarks.map((mark, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 text-gray-400 mr-2" />
                                <span className="text-gray-600">{mark.semester}</span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {mark.marks}/{mark.maxMarks}
                              </span>
                            </div>
                          ))}
                        </div>
                                             ) : (
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
                       )}
                    </div>
                  );
                })}
              </div>

              {/* Overall Statistics */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Overall Statistics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {subjects.length}
                    </div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {marks.length}
                    </div>
                    <div className="text-sm text-gray-600">Marks Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {marks.length > 0 ? Math.round((marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.reduce((sum, mark) => sum + mark.maxMarks, 0)) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(marks.map(mark => mark.semester)).size}
                    </div>
                    <div className="text-sm text-gray-600">Semesters</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
