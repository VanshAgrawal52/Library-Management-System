import React, { useState, useEffect } from 'react';
import { Search, User, Github, BookOpen, FileText, Users, Calendar, Link, Building, Send, Check } from 'lucide-react';
import { useNavigate } from "react-router-dom"; // if you’re using React Router
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function LibraryRequestPage() {
  const navigate = useNavigate();

  // Check for token and user data in localStorage when component mounts
  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // setUser(parsedUser);
        // Set email in formData
        setFormData(prev => ({
          ...prev,
          email: parsedUser.email || '' // Set email from user object, fallback to empty string
        }));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    } else {
      // No user data found, redirect to login
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
    // Requester Details
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Snippet 8: Example for frontend integration (replace setTimeout in handleSubmit)
  const handleSubmit = async () => {
    // Check required fields
    const requiredFields = ['email','sourceUrl', 'documentTitle', 'publicationName', 'publicationYear', 'volumeNo', 'publisher', 'authors'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      setStatus('Please fill all compulsory fields (marked with *)');
      setTimeout(() => setStatus(''), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth('http://localhost:5000/api/requests/submit', {  // Adjust URL if backend is on different port/domain
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)  // Note: Backend doesn't use email from body for storage, but you can send it
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('Request submitted successfully!');
        console.log('Request submitted:', data);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              <span>Document Request</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Request Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Document</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Submit your document request and we'll help you access the resources you need for your research and studies.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 bg-blue-100 text-blue-800'
                }`}>
                <FileText className="w-5 h-5" />
                <span className="font-medium">Document Details</span>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 relative">
            <div className="space-y-8">
              {/* Step 2: Document Details */}
              <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'}`}>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Information</h2>
                    <p className="text-gray-600">Details about the document you need</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title *</label>
                    <input
                      type="text"
                      name="documentTitle"
                      value={formData.documentTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                      placeholder="Enter the full title of the document"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Authors *</label>
                    <input
                      type="text"
                      name="authors"
                      value={formData.authors}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                      placeholder="Lastname, Firstname initial; Shakespeare, W.; Doe, J."
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="group md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Name *</label>
                      <input
                        type="text"
                        name="publicationName"
                        value={formData.publicationName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="Journal or publication name"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="publicationYear"
                          value={formData.publicationYear}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Volume *</label>
                      <input
                        type="text"
                        name="volumeNo"
                        value={formData.volumeNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="Vol. 1"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Issue</label>
                      <input
                        type="text"
                        name="issueNo"
                        value={formData.issueNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="Issue 1"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Page Range</label>
                      <input
                        type="text"
                        name="pageRange"
                        value={formData.pageRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="1-20"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL/DOI *</label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="url"
                        name="sourceUrl"
                        value={formData.sourceUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="https://doi.org/10.1000/example or direct URL"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Publisher *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 group-hover:border-green-300"
                        placeholder="Publisher name"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8">

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {status && (
                <div className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 ${status.includes('successfully')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                  {status.includes('successfully') ? (
                    <Check className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-medium">{status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Types</h3>
              <p className="text-sm text-gray-600">We support journal articles, books, conference papers, and more.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Processing</h3>
              <p className="text-sm text-gray-600">Most requests are processed within 2-3 business days.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email Delivery</h3>
              <p className="text-sm text-gray-600">Documents are delivered directly to your registered email.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-gray-600">© 2025 LibraryX. All rights reserved.</div>
          <div className="flex items-center space-x-3 text-gray-600">
            <span>Built with ❤️ by</span>
            <a
              href="#"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Kavya
            </a>
            <Github className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}