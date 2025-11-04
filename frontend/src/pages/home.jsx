import React, { useState, useEffect } from 'react';
import { Search, User, Github, BookOpen, FileText, Users, Calendar, Link, Building, Send, Check, GraduationCap, Building2, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from '../utils/fetchWithAuth';
import logo from '../assets/logo.png';

export default function LibraryRequestPage() {
  const navigate = useNavigate();

  // Check for token and user data in localStorage when component mounts
  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          email: parsedUser.email || ''
        }));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    } else {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [navigate]);

  // Check for token in localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: '',
    documentTitle: '',
    authors: '',
    publicationName: '',
    publicationYear: '',
    volumeNo: '',
    issueNo: '',
    pageRange: '',
    sourceUrl: '',
    publisher: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = ['email', 'sourceUrl', 'documentTitle', 'publicationName', 'publicationYear', 'volumeNo', 'publisher', 'authors'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setStatus('Please fill all compulsory fields (marked with *)');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth('http://localhost:5000/api/requests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('Request submitted successfully!');
        // Reset form
        setFormData({
          email: formData.email,
          documentTitle: '',
          authors: '',
          publicationName: '',
          publicationYear: '',
          volumeNo: '',
          issueNo: '',
          pageRange: '',
          sourceUrl: '',
          publisher: ''
        });
      } else {
        setStatus(data.message || 'Submission failed');
      }
    } catch (error) {
      setStatus('Error submitting request');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatus(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Status Toast */}
      {status && (
        <div className={`fixed top-4 right-4 z-50 border-l-4 shadow-xl rounded-lg p-4 max-w-md animate-slide-in ${status.includes('successfully')
          ? 'bg-white border-green-600'
          : 'bg-white border-red-600'
          }`}>
          <div className="flex items-center space-x-3">
            {status.includes('successfully') ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`font-medium ${status.includes('successfully') ? 'text-green-800' : 'text-red-800'}`}>
              {status}
            </p>
          </div>
        </div>
      )}

      {/* Header with IIT Jodhpur Branding */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo and Institute Name */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* <div className="w-14 h-14 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div> */}
                <img
                  src="/src/assets/logo.png"
                  alt="IIT Jodhpur Logo"
                  className="w-14 h-14 object-contain rounded-lg shadow-md"
                />
                <div>
                  <h1 className="text-xl font-bold text-slate-800 leading-tight">Indian Institute of Technology</h1>
                  <p className="text-sm text-blue-700 font-semibold">Jodhpur</p>
                </div>
              </div>
              <div className="hidden lg:block w-px h-12 bg-slate-300 ml-4"></div>
              <div className="hidden lg:flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <span className="text-lg font-semibold text-slate-800">Central Library Portal</span>
              </div>
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => navigate('/user')}
                  className="text-slate-700 hover:text-blue-700 font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>My Requests</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>

              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
              <Building2 className="w-4 h-4" />
              <span>Library Services</span>
              <span>/</span>
              <span className="text-blue-700 font-medium">New Document Request</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Submit Document Request</h2>
            <p className="text-slate-600">Request academic documents, journal articles, or research papers from the Central Library</p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-bold text-slate-900">All Document Types</h3>
              </div>
              <p className="text-sm text-slate-600">Journal articles, books, conference papers, and more</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="font-bold text-slate-900">Quick Processing</h3>
              </div>
              <p className="text-sm text-slate-600">Most requests processed within 2-3 business days</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-700" />
                </div>
                <h3 className="font-bold text-slate-900">Email Delivery</h3>
              </div>
              <p className="text-sm text-slate-600">Documents delivered directly to your email</p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Form Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-700" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Document Information</h3>
                  <p className="text-sm text-slate-600">Please provide complete details about the document you need</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Document Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Document Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="documentTitle"
                    value={formData.documentTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter the full title of the document"
                  />
                </div>

                {/* Authors */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Authors <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="authors"
                    value={formData.authors}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Lastname, Firstname initial; e.g., Shakespeare, W.; Doe, J."
                  />
                  <p className="text-xs text-slate-500">Separate multiple authors with semicolons</p>
                </div>

                {/* Publication Details Row */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Publication Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="publicationName"
                      value={formData.publicationName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Journal or publication name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Year <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="number"
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                {/* Volume, Issue, Page Range Row */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Volume <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="volumeNo"
                      value={formData.volumeNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Issue
                    </label>
                    <input
                      type="text"
                      name="issueNo"
                      value={formData.issueNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Page Range
                    </label>
                    <input
                      type="text"
                      name="pageRange"
                      value={formData.pageRange}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., 1-20"
                    />
                  </div>
                </div>

                {/* Source URL/DOI */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Source URL/DOI <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="url"
                      name="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://doi.org/10.1000/example or direct URL"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Provide DOI link or direct URL to the document</p>
                </div>

                {/* Publisher */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Publisher <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Publisher name (e.g., Springer, IEEE, Elsevier)"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 mt-3">
                    Fields marked with <span className="text-red-600">*</span> are required
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Need Help?</p>
                <p>If you're having trouble finding the required information, please contact the library staff at <span className="font-medium">library@iitj.ac.in</span> or visit the Central Library help desk.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img
                src="/src/assets/logo.png"
                alt="IIT Jodhpur Logo"
                className="w-14 h-14 object-contain rounded-lg shadow-md"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">Indian Institute of Technology, Jodhpur</p>
                <p className="text-xs text-slate-600">NH 62, Surpura Bypass Road, Karwar, Jodhpur - 342030</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-600">© 2025 IIT Jodhpur Central Library. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-1">Library Management System v2.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}