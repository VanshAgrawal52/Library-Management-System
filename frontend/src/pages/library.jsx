import React, { useState, useEffect } from 'react';
import { Search, User, Github, BookOpen, Plus, Edit2, Trash2, Mail, Phone, MapPin, FileText, AlertCircle, Building2, Users, TrendingUp, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';

const ModernLibraryPage = () => {
  const navigate = useNavigate();

  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPersonName: '',
    contactPhoneNo: '',
    contactAddress: '',
    remarks: '',
  });

  // State for list of libraries and requests
  const [libraries, setLibraries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Library search
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLibrary, setExpandedLibrary] = useState(null); // Track expanded library for requests
  const [libraryRequests, setLibraryRequests] = useState({}); // Store requests per library
  const [requestsLoading, setRequestsLoading] = useState({}); // Track loading state for requests
  const [documentSearchTerm, setDocumentSearchTerm] = useState(''); // Document search

  // Verify admin and fetch libraries on component mount
  useEffect(() => {
    const verifyAdminAndFetch = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:5000/api/admin/check-admin', {
          method: 'GET',
        });

        if (response.status === 403) {
          navigate('/user');
          return;
        } else if (!response.ok) {
          throw new Error(`Error verifying admin: ${response.status}`);
        }

        const data = await response.json();
        if (!data.isAdmin) {
          navigate('/user');
          return;
        }

        fetchLibraries();
      } catch (error) {
        console.error('Error verifying admin:', error);
        navigate('/login');
      }
    };

    verifyAdminAndFetch();
  }, [navigate]);

  // Function to fetch libraries
  const fetchLibraries = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/library/fetch', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching libraries: ${response.status}`);
      }

      const data = await response.json();
      setLibraries(data.libraries);
      setError('');
    } catch (err) {
      setError('Failed to fetch libraries. Please try again.');
      console.error(err);
    }
  };

  // Function to fetch requests for a specific library
  const fetchLibraryRequests = async (libraryId) => {
    setRequestsLoading(prev => ({ ...prev, [libraryId]: true }));
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/library/${libraryId}/requests`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error fetching requests for library: ${response.status}`);
      }

      const data = await response.json();
      setLibraryRequests(prev => ({ ...prev, [libraryId]: data.requests }));
    } catch (err) {
      setError(`Failed to fetch requests for library. Please try again.`);
      console.error(err);
    } finally {
      setRequestsLoading(prev => ({ ...prev, [libraryId]: false }));
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const adminResponse = await fetchWithAuth('http://localhost:5000/api/admin/check-admin', {
        method: 'GET',
      });

      if (adminResponse.status === 403) {
        navigate('/user');
        return;
      } else if (!adminResponse.ok) {
        throw new Error(`Error verifying admin: ${adminResponse.status}`);
      }

      const adminData = await adminResponse.json();
      if (!adminData.isAdmin) {
        navigate('/user');
        return;
      }

      const response = await fetchWithAuth('http://localhost:5000/api/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error adding library: ${response.status}`);
      }

      setSuccess('Library added successfully!');
      setError('');
      setFormData({
        name: '',
        email: '',
        contactPersonName: '',
        contactPhoneNo: '',
        contactAddress: '',
        remarks: '',
      });
      setIsFormVisible(false);
      setTimeout(() => setSuccess(''), 3000);

      fetchLibraries();
    } catch (err) {
      setError(err.message || 'Failed to add library. Please try again.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
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
      } else {
        console.error('Logout failed:', response.statusText);
        alert('Failed to log out. Please try again.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('An error occurred during logout. Please try again.');
    }
  };

  // Toggle expanded library for requests
  const toggleLibraryRequests = (libraryId) => {
    if (expandedLibrary === libraryId) {
      setExpandedLibrary(null);
    } else {
      setExpandedLibrary(libraryId);
      if (!libraryRequests[libraryId]) {
        fetchLibraryRequests(libraryId);
      }
    }
  };

  // Library search filter with document search
  const filteredLibraries = libraries.filter(library => {
    const librarySearchLower = searchTerm.toLowerCase().trim();
    const documentSearchLower = documentSearchTerm.toLowerCase().trim();
    
    // If no search terms, show all libraries
    if (!librarySearchLower && !documentSearchLower) return true;
    
    // Check library-level search
    const libraryMatch = !librarySearchLower || (
      library.name.toLowerCase().includes(librarySearchLower) ||
      library.email.toLowerCase().includes(librarySearchLower) ||
      (library.contactPersonName && library.contactPersonName.toLowerCase().includes(librarySearchLower)) ||
      (library.contactPhoneNo && library.contactPhoneNo.toLowerCase().includes(librarySearchLower)) ||
      (library.remarks && library.remarks.toLowerCase().includes(librarySearchLower))
    );
    
    // If no document search, return library match result
    if (!documentSearchLower) return libraryMatch;
    
    // Check if library has any requests matching the document search
    const requests = libraryRequests[library._id] || [];
    const hasMatchingRequest = requests.some(request =>
      request.documentTitle.toLowerCase().includes(documentSearchLower) ||
      request.publisher.toLowerCase().includes(documentSearchLower) ||
      request.authors.toLowerCase().includes(documentSearchLower) ||
      request.publicationName.toLowerCase().includes(documentSearchLower)
    );
    
    // Return true if library matches AND has matching requests (or if only document search is active)
    return libraryMatch && hasMatchingRequest;
  });

  // Get filtered requests for a specific library
  const getFilteredRequests = (libraryId) => {
    const requests = libraryRequests[libraryId] || [];
    const searchLower = documentSearchTerm.toLowerCase().trim();
    if (!searchLower) return requests;
    return requests.filter(request =>
      request.documentTitle.toLowerCase().includes(searchLower) ||
      request.publisher.toLowerCase().includes(searchLower) ||
      request.authors.toLowerCase().includes(searchLower) ||
      request.publicationName.toLowerCase().includes(searchLower)
    );
  };

  // Auto-expand libraries when document search is active
  useEffect(() => {
    if (documentSearchTerm.trim()) {
      // Fetch requests for all libraries if not already fetched
      libraries.forEach(library => {
        if (!libraryRequests[library._id] && !requestsLoading[library._id]) {
          fetchLibraryRequests(library._id);
        }
      });
    }
  }, [documentSearchTerm, libraries]);

  // Format date for requests
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color for requests
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'processing': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'pending': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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
            <div className="flex items-center space-x-6 text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors font-medium">New Request</Link>
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
              <Link to="/analytics" className="hover:text-blue-600 transition-colors font-medium">Analytics</Link>
              <button onClick={handleLogout} className="hover:text-blue-600 transition-colors font-medium">Logout</button>
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Activity className="w-4 h-4" />
              <span>Library Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Library <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Network</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage and oversee all library partners and their document requests
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{libraries.length}</div>
                    <div className="text-sm text-gray-600">Total Libraries</div>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{libraries.filter(l => l.contactPersonName).length}</div>
                    <div className="text-sm text-gray-600">Active Contacts</div>
                  </div>
                </div>
                <div className="w-full bg-green-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: `${libraries.length ? (libraries.filter(l => l.contactPersonName).length / libraries.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{filteredLibraries.length}</div>
                    <div className="text-sm text-gray-600">Search Results</div>
                  </div>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: `${libraries.length ? (filteredLibraries.length / libraries.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="backdrop-blur-sm bg-green-50/80 border border-green-200 rounded-2xl p-4 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="backdrop-blur-sm bg-red-50/80 border border-red-200 rounded-2xl p-4 mb-6 flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Add Library Button */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Library</h2>
                  <p className="text-gray-600">Register a new library partner</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{isFormVisible ? 'Hide Form' : 'Add Library'}</span>
              </button>
            </div>

            {/* Form */}
            {isFormVisible && (
              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Library Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter library name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person Name</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone No</label>
                  <input
                    type="text"
                    name="contactPhoneNo"
                    value={formData.contactPhoneNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Address</label>
                  <input
                    type="text"
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter remarks"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Adding Library...</span>
                      </div>
                    ) : 'Add Library'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Libraries Table */}
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Library Network</h2>
                    <p className="text-gray-600">Manage all library partners and their requests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search libraries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={documentSearchTerm}
                      onChange={(e) => setDocumentSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {filteredLibraries.length} of {libraries.length}
                  </div>
                </div>
              </div>
            </div>

            {filteredLibraries.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-2">No libraries found</div>
                <div className="text-gray-600">Try adjusting your search terms or add a new library</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Library Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact Person</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLibraries.map((library) => (
                      <React.Fragment key={library._id}>
                        <tr
                          className="border-b border-gray-200/50 last:border-b-0 hover:bg-blue-50/30 transition-all duration-300"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div className="font-semibold text-gray-900">{library.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{library.email}</span>
                              </div>
                              {library.contactPhoneNo && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  <span>{library.contactPhoneNo}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{library.contactPersonName || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {library.contactAddress ? (
                              <div className="flex items-start space-x-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{library.contactAddress}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 line-clamp-2">{library.remarks || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleLibraryRequests(library._id)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                            >
                              {expandedLibrary === library._id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                              <span>View Requests</span>
                            </button>
                          </td>
                        </tr>
                        {expandedLibrary === library._id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan="6" className="px-6 py-4">
                              {requestsLoading[library._id] ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                  <span className="text-gray-600">Loading requests...</span>
                                </div>
                              ) : !libraryRequests[library._id] || libraryRequests[library._id].length === 0 ? (
                                <div className="text-center text-gray-600">No requests sent to this library.</div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Document Requests</h3>
                                  </div>
                                  {getFilteredRequests(library._id).length === 0 ? (
                                    <div className="text-center text-gray-600">No matching requests found.</div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full">
                                        <thead>
                                          <tr className="bg-gray-100/50">
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Authors</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Publication</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Publisher</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested At</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {getFilteredRequests(library._id).map((request) => (
                                            <tr key={request._id} className="border-b border-gray-200/50">
                                              <td className="px-4 py-2 text-sm text-gray-900 line-clamp-2">{request.documentTitle}</td>
                                              <td className="px-4 py-2 text-sm text-gray-600">{request.authors}</td>
                                              <td className="px-4 py-2 text-sm text-gray-600">{request.publicationName}</td>
                                              <td className="px-4 py-2 text-sm text-gray-600">{request.publisher}</td>
                                              <td className="px-4 py-2">
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                                                  {request.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2 text-sm text-gray-600">{formatDate(request.createdAt)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Network Management</h3>
              <p className="text-gray-600">Centralized management of all library partners and their contact information for seamless coordination.</p>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contact Directory</h3>
              <p className="text-gray-600">Comprehensive contact details and designated personnel for efficient communication and collaboration.</p>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Access</h3>
              <p className="text-gray-600">Quick search and filtering capabilities to find library information and requests instantly.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="text-gray-600">© 2025 LibraryX. All rights reserved.</div>
          <div className="flex items-center space-x-3 text-gray-600">
            <span>Built with ❤️ by</span>
            <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Kavya</a>
            <Github className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLibraryPage;