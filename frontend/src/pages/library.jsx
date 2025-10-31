import React, { useState, useEffect } from 'react';
import { Search, User, BookOpen, Plus, Edit2, Trash2, Mail, Phone, MapPin, FileText, AlertCircle, Building2, Users, TrendingUp, Activity, ChevronDown, ChevronUp, GraduationCap, CheckCircle, ExternalLink } from 'lucide-react';
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
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'pending': return 'bg-slate-50 text-slate-700 border border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Status Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-emerald-600 shadow-xl rounded-lg p-4 max-w-md animate-slide-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-slate-800 font-medium">{success}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-red-600 shadow-xl rounded-lg p-4 max-w-md animate-slide-in">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-slate-800 font-medium">{error}</p>
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
                <div className="w-14 h-14 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 leading-tight">Indian Institute of Technology</h1>
                  <p className="text-sm text-blue-700 font-semibold">Jodhpur</p>
                </div>
              </div>
              <div className="hidden lg:block w-px h-12 bg-slate-300 ml-4"></div>
              <div className="hidden lg:flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <span className="text-lg font-semibold text-slate-800">Library Network</span>
              </div>
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">New Request</Link>
                <Link to="/dashboard" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Dashboard</Link>
                <Link to="/adminPanel" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Admin Panel</Link>
                <Link to="/analytics" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Analytics</Link>
                <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all">Logout</button>
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
              <Building2 className="w-4 h-4" />
              <span>Admin Dashboard</span>
              <span>/</span>
              <span className="text-blue-700 font-medium">Library Network</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Partner Library Management</h2>
            <p className="text-slate-600">Manage partner libraries and track document request distribution</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{libraries.length}</div>
                  <div className="text-sm text-slate-600">Total Libraries</div>
                </div>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{libraries.filter(l => l.contactPersonName).length}</div>
                  <div className="text-sm text-slate-600">Active Contacts</div>
                </div>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${libraries.length ? (libraries.filter(l => l.contactPersonName).length / libraries.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{filteredLibraries.length}</div>
                  <div className="text-sm text-slate-600">Search Results</div>
                </div>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${libraries.length ? (filteredLibraries.length / libraries.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* Add Library Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Library Partner</h3>
                  <p className="text-sm text-slate-600">Register a new library in the network</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isFormVisible 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isFormVisible ? 'Cancel' : 'Add Library'}
              </button>
            </div>

            {/* Form */}
            {isFormVisible && (
              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Library Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter library name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="library@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person Name</label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="contactPhoneNo"
                    value={formData.contactPhoneNo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Library address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isLoading 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isLoading ? 'Adding Library...' : 'Add Library'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Search & Filter</h3>
                <p className="text-sm text-slate-600">Find libraries or specific document requests</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search libraries by name, email, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents by title, author, publication..."
                  value={documentSearchTerm}
                  onChange={(e) => setDocumentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredLibraries.length}</span> of <span className="font-semibold text-slate-900">{libraries.length}</span> libraries
              </p>
            </div>
          </div>

          {/* Libraries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Partner Libraries</h3>
                  <p className="text-sm text-slate-600">View and manage all library partners in the network</p>
                </div>
              </div>
            </div>

            {filteredLibraries.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-xl font-semibold text-slate-900 mb-2">No libraries found</div>
                <div className="text-slate-600">Try adjusting your search terms or add a new library</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Library Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Information</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Person</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Document Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLibraries.map((library) => (
                      <React.Fragment key={library._id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-700" />
                              </div>
                              <div className="font-semibold text-slate-900">{library.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm text-slate-900">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{library.email}</span>
                              </div>
                              {library.contactPhoneNo && (
                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <span>{library.contactPhoneNo}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-slate-900">{library.contactPersonName || '-'}</div>
                          </td>
                          <td className="px-6 py-5">
                            {library.contactAddress ? (
                              <div className="flex items-start space-x-2 text-sm text-slate-600 max-w-xs">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                <span className="line-clamp-2">{library.contactAddress}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-slate-600 line-clamp-2 max-w-xs">{library.remarks || '-'}</div>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() => toggleLibraryRequests(library._id)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
                            >
                              {expandedLibrary === library._id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                              <span>{expandedLibrary === library._id ? 'Hide' : 'View'} Requests</span>
                            </button>
                          </td>
                        </tr>
                        {expandedLibrary === library._id && (
                          <tr className="bg-slate-50">
                            <td colSpan="6" className="px-6 py-6">
                              {requestsLoading[library._id] ? (
                                <div className="flex items-center justify-center space-x-2 py-8">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                  <span className="text-slate-600">Loading requests...</span>
                                </div>
                              ) : !libraryRequests[library._id] || libraryRequests[library._id].length === 0 ? (
                                <div className="text-center py-8">
                                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                  <p className="text-slate-600">No requests sent to this library yet.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold text-slate-900">Document Requests Sent to {library.name}</h4>
                                    <span className="text-sm text-slate-600">
                                      {getFilteredRequests(library._id).length} request(s)
                                    </span>
                                  </div>
                                  {getFilteredRequests(library._id).length === 0 ? (
                                    <div className="text-center py-8">
                                      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                      <p className="text-slate-600">No matching requests found for your search.</p>
                                    </div>
                                  ) : (
                                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                          <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Document Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Authors</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Publication</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Publisher</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Date Requested</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                          {getFilteredRequests(library._id).map((request) => (
                                            <tr key={request._id} className="hover:bg-slate-50">
                                              <td className="px-4 py-3">
                                                <div className="text-sm text-slate-900 font-medium line-clamp-2 max-w-xs">
                                                  {request.documentTitle}
                                                </div>
                                                {request.sourceUrl && (
                                                  <a 
                                                    href={request.sourceUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                                                  >
                                                    <ExternalLink className="w-3 h-3" /> View Source
                                                  </a>
                                                )}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-600">{request.authors}</td>
                                              <td className="px-4 py-3 text-sm text-slate-600">{request.publicationName}</td>
                                              <td className="px-4 py-3 text-sm text-slate-600">{request.publisher}</td>
                                              <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                                                  {request.status}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 text-sm text-slate-600">{formatDate(request.createdAt)}</td>
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

            {/* Table Footer */}
            {filteredLibraries.length > 0 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredLibraries.length}</span> of <span className="font-semibold text-slate-900">{libraries.length}</span> libraries
                  </p>
                  <p className="text-slate-500">IIT Jodhpur Central Library</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Network Management</h3>
              <p className="text-slate-600 text-center">Centralized management of all library partners and their contact information for seamless coordination.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Contact Directory</h3>
              <p className="text-slate-600 text-center">Comprehensive contact details and designated personnel for efficient communication and collaboration.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Request Tracking</h3>
              <p className="text-slate-600 text-center">Track all document requests sent to partner libraries with real-time status updates and history.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
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
};

export default ModernLibraryPage;