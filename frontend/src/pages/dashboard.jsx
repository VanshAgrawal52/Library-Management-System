import React, { useState, useEffect } from 'react';
import { Search, User, Github, Filter, Eye, Check, X, Clock, AlertCircle, FileText, ExternalLink, BookOpen, Users, Calendar, TrendingUp, Activity, Bell } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom"; // if you’re using React Router

export default function ModernLibraryDashboard() {
  const navigate = useNavigate();

  // Check for token in localStorage when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Mock data for user requests with updated fields
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: 'POST',
        credentials: 'include', // Include cookies in the request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any client-side user data (e.g., localStorage, context, or state)
        localStorage.removeItem('token'); // Example: Remove user data if stored
        localStorage.removeItem('user'); // Example: Remove user data if stored
        // Redirect to login page
        navigate('/login');
      } else {
        console.error('Logout failed:', response.statusText);
        alert('Failed to log out. Please try again.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('An error occurred during logout. Please try again.');
    }
  };

  const [requests, setRequests] = useState([
    {
      id: 1,
      // User Details
      email: "john.doe@university.edu",
      rollEmployeeNo: "CS2021001",
      requesterName: "John Doe",
      patronCategory: "student",
      department: "Computer Science",

      // Document Details
      documentTitle: "Machine Learning: A Probabilistic Perspective",
      authors: "Kevin P. Murphy",
      publicationName: "MIT Press",
      publicationYear: 2012,
      volumeNo: "",
      issueNo: "",
      pageRange: "",
      sourceUrl: "https://mitpress.mit.edu/books/machine-learning-1",
      publisher: "MIT Press",

      status: "pending",
      requestedAt: "2025-08-12T10:30:00Z"
    },
    {
      id: 2,
      email: "sarah.johnson@university.edu",
      rollEmployeeNo: "ENG2020045",
      requesterName: "Sarah Johnson",
      patronCategory: "student",
      department: "English Literature",

      documentTitle: "The Great Gatsby and the American Dream",
      authors: "F. Scott Fitzgerald, Harold Bloom",
      publicationName: "Modern Critical Interpretations",
      publicationYear: 2010,
      volumeNo: "12",
      issueNo: "3",
      pageRange: "45-68",
      sourceUrl: "",
      publisher: "Chelsea House Publications",

      status: "approved",
      requestedAt: "2025-08-11T14:15:00Z"
    },
    {
      id: 3,
      email: "m.chen@research.org",
      rollEmployeeNo: "RES2024007",
      requesterName: "Dr. Michael Chen",
      patronCategory: "researcher",
      department: "Climate Science Institute",

      documentTitle: "Climate Change Impact on Arctic Ice Sheets",
      authors: "Emma Wilson, Robert Taylor, Lisa Chang",
      publicationName: "Nature Climate Change",
      publicationYear: 2024,
      volumeNo: "14",
      issueNo: "8",
      pageRange: "1023-1035",
      sourceUrl: "https://doi.org/10.1038/s41558-024-01234-5",
      publisher: "Nature Publishing Group",

      status: "processing",
      requestedAt: "2025-08-10T09:45:00Z"
    },
    {
      id: 4,
      email: "lisa.brown@company.com",
      rollEmployeeNo: "EXT2024003",
      requesterName: "Lisa Brown",
      patronCategory: "external",
      department: "Marketing Division",

      documentTitle: "Digital Marketing Strategies in the Modern Era",
      authors: "Philip Kotler, Gary Armstrong",
      publicationName: "Journal of Marketing Research",
      publicationYear: 2023,
      volumeNo: "60",
      issueNo: "4",
      pageRange: "112-128",
      sourceUrl: "",
      publisher: "American Marketing Association",

      status: "rejected",
      requestedAt: "2025-08-09T16:20:00Z"
    },
    {
      id: 5,
      email: "d.wilson@physics.edu",
      rollEmployeeNo: "PHYS2019012",
      requesterName: "David Wilson",
      patronCategory: "faculty",
      department: "Physics Department",

      documentTitle: "Quantum Mechanics and Path Integrals",
      authors: "Richard P. Feynman, Albert R. Hibbs",
      publicationName: "McGraw-Hill Education",
      publicationYear: 2010,
      volumeNo: "",
      issueNo: "",
      pageRange: "",
      sourceUrl: "https://www.mheducation.com/highered/product/quantum-mechanics-path-integrals-feynman-hibbs/9780070206502.html",
      publisher: "McGraw-Hill Education",

      status: "approved",
      requestedAt: "2025-08-08T11:10:00Z"
    },
    {
      id: 6,
      email: "r.taylor@med.university.edu",
      rollEmployeeNo: "MED2022089",
      requesterName: "Dr. Robert Taylor",
      patronCategory: "faculty",
      department: "Medical Ethics",

      documentTitle: "AI Ethics in Healthcare Decision Making",
      authors: "Jennifer Adams, Mark Thompson, Sarah Davis",
      publicationName: "Journal of Medical Ethics",
      publicationYear: 2024,
      volumeNo: "50",
      issueNo: "2",
      pageRange: "89-102",
      sourceUrl: "https://doi.org/10.1136/medethics-2024-109234",
      publisher: "BMJ Publishing Group",

      status: "pending",
      requestedAt: "2025-08-07T13:30:00Z"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPatronCategory, setFilterPatronCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Admin actions
  const handleApprove = (requestId) => {
    setRequests(requests.map(request =>
      request.id === requestId
        ? { ...request, status: 'approved' }
        : request
    ));
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(request =>
      request.id === requestId
        ? { ...request, status: 'rejected' }
        : request
    ));
  };

  const handleSetProcessing = (requestId) => {
    setRequests(requests.map(request =>
      request.id === requestId
        ? { ...request, status: 'processing' }
        : request
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'processing': return 'text-amber-700 bg-amber-100 border-amber-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPatronCategoryColor = (category) => {
    switch (category) {
      case 'student': return 'text-blue-700 bg-blue-100';
      case 'faculty': return 'text-green-700 bg-green-100';
      case 'staff': return 'text-amber-700 bg-amber-100';
      case 'researcher': return 'text-indigo-700 bg-indigo-100';
      case 'external': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPatronCategory = filterPatronCategory === 'all' || request.patronCategory === filterPatronCategory;
    const matchesSearch = searchTerm === '' ||
      request.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPatronCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get counts for status overview
  const statusCounts = requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LibraryX Admin</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6 text-gray-600">
              <Link to="/libraryRequest" className="hover:text-blue-600 transition-colors font-medium">
                New Request
              </Link>
              <Link to="/analytics" className="hover:text-blue-600 transition-colors font-medium">
                Analytics
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>

            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Document Request <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and manage document requests from users across the institution
            </p>
          </div>

          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.pending || 0}</div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-2 rounded-full" style={{ width: `${((statusCounts.pending || 0) / requests.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.processing || 0}</div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full" style={{ width: `${((statusCounts.processing || 0) / requests.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.approved || 0}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: `${((statusCounts.approved || 0) / requests.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <X className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.rejected || 0}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full" style={{ width: `${((statusCounts.rejected || 0) / requests.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filter Requests</h2>
                <p className="text-gray-600">Refine your view</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filterPatronCategory}
                  onChange={(e) => setFilterPatronCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 appearance-none"
                >
                  <option value="all">All Categories</option>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                  <option value="researcher">Researcher</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="text-lg font-semibold text-gray-900">
                  {filteredRequests.length} of {requests.length} requests
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Document Requests</h2>
                  <p className="text-gray-600">Manage all incoming requests</p>
                </div>
              </div>
            </div>

            {/* Table Header - Hidden on mobile */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 bg-gray-50/50 border-b border-gray-200/50 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-4">Document Details</div>
              <div className="col-span-3">Requester Info</div>
              <div className="col-span-2">Publication</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Body */}
            <div>
              {filteredRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="border-b border-gray-200/50 last:border-b-0 hover:bg-blue-50/30 transition-all duration-300"
                >
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 items-center">
                    {/* Document Details */}
                    <div className="col-span-4">
                      <div className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {request.documentTitle}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        by {request.authors}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{request.publisher} • {request.publicationYear}</span>
                        {request.sourceUrl && (
                          <a
                            href={request.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {(request.volumeNo || request.issueNo || request.pageRange) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {request.volumeNo && `Vol. ${request.volumeNo}`}
                          {request.issueNo && ` Issue ${request.issueNo}`}
                          {request.pageRange && ` pp. ${request.pageRange}`}
                        </div>
                      )}
                    </div>

                    {/* Requester Info */}
                    <div className="col-span-3">
                      <div className="font-semibold text-gray-900">{request.requesterName}</div>
                      <div className="text-sm text-gray-600">{request.rollEmployeeNo}</div>
                      <div className="text-xs text-gray-500">{request.email}</div>
                      <div className="text-xs text-gray-500">{request.department}</div>
                      <div className="mt-2">
                        <span className={`text-xs font-medium px-3 py-2 rounded-full border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {formatDate(request.requestedAt)}
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex gap-2 pt-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSetProcessing(request.id)}
                            className="flex-1 p-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Process
                          </button>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 p-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 p-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {request.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 p-2 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="flex-1 p-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(request.status === 'approved' || request.status === 'rejected') && (
                        <div className="flex-1 text-center text-sm text-gray-500 font-medium py-2">
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-2">No requests found</div>
                <div className="text-gray-600">Try adjusting your filters or search terms</div>
              </div>
            )}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Document Types</h3>
              <p className="text-gray-600">Managing journal articles, books, conference papers, and research documents from various academic sources.</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Processing</h3>
              <p className="text-gray-600">Streamlined workflow ensures most document requests are processed and delivered within 2-3 business days.</p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-User Support</h3>
              <p className="text-gray-600">Supporting students, faculty, researchers, and external users with comprehensive document access services.</p>
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