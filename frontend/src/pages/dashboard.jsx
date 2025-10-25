import React, { useState, useEffect } from 'react';
import { Search, User, Github, Filter, Eye, Check, X, Clock, AlertCircle, FileText, ExternalLink, BookOpen, Calendar, TrendingUp, Activity, Hourglass, Users, Send, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';

export default function ModernLibraryDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraries, setSelectedLibraries] = useState([]);
  const [libraryModalError, setLibraryModalError] = useState('');
  const [libraryModalSuccess, setLibraryModalSuccess] = useState('');
  const [libraryModalLoading, setLibraryModalLoading] = useState(false);
  const [processingLoading, setProcessingLoading] = useState({});
  const [approveLoading, setApproveLoading] = useState({});
  const [rejectLoading, setRejectLoading] = useState({});
  const [editLoading, setEditLoading] = useState({});
  const [editFormData, setEditFormData] = useState({
    documentTitle: '',
    authors: '',
    publicationName: '',
    publisher: '',
    publicationYear: '',
    volumeNo: '',
    issueNo: '',
    pageRange: '',
    sourceUrl: '',
  });
  const [editError, setEditError] = useState('');

  const rejectionReasons = [
    'Already Subscribed',
    'Available',
    'Open Access',
    'Not Available',
    'Invalid Request',
  ];

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

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

        fetchRequests();
      } catch (error) {
        console.error('Error verifying admin:', error);
        navigate('/login');
      }
    };

    verifyAdmin();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetchWithAuth('http://localhost:5000/api/requests/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching requests: ${response.status}`);
      }

      const data = await response.json();
      const transformedData = data.map(request => ({
        ...request,
        requestedAt: request.createdAt,
      }));
      setRequests(transformedData);
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
    }
  };

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
      setLibraryModalError('');
    } catch (error) {
      setLibraryModalError('Failed to fetch libraries. Please try again.');
      console.error(error);
    }
  };

  const handleSendEmails = async () => {
    if (selectedLibraries.length === 0) {
      setLibraryModalError('Please select at least one library.');
      return;
    }

    setLibraryModalLoading(true);
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/library/${selectedRequestId}/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ libraryIds: selectedLibraries }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error sending emails: ${response.status}`);
      }

      setLibraryModalSuccess('Emails sent successfully!');
      setLibraryModalError('');
      setTimeout(() => {
        setShowLibraryModal(false);
        setSelectedLibraries([]);
        setLibraryModalSuccess('');
      }, 2000);
    } catch (error) {
      setLibraryModalError(error.message || 'Failed to send emails. Please try again.');
      setLibraryModalSuccess('');
    } finally {
      setLibraryModalLoading(false);
    }
  };

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

  const handleApprove = async (requestId) => {
    setSelectedRequestId(requestId);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!pdfFile) {
      alert('Please upload a PDF file.');
      return;
    }

    setApproveLoading(prev => ({ ...prev, [selectedRequestId]: true }));

    try {
      const formData = new FormData();
      formData.append('status', 'accepted');
      formData.append('pdf', pdfFile);

      const response = await fetchWithAuth(`http://localhost:5000/api/requests/${selectedRequestId}`, {
        method: 'PATCH',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchRequests();
      setShowApproveModal(false);
      setPdfFile(null);
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status to accepted. Please try again.');
    } finally {
      setApproveLoading(prev => { const copy = { ...prev }; delete copy[selectedRequestId]; return copy; });
    }
  };

  const handleReject = async (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason) {
      alert('Please select a rejection reason.');
      return;
    }

    setRejectLoading(prev => ({ ...prev, [selectedRequestId]: true }));

    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/requests/${selectedRequestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'rejected', rejectReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchRequests();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status to rejected. Please try again.');
    } finally {
      setRejectLoading(prev => { const copy = { ...prev }; delete copy[selectedRequestId]; return copy; });
    }
  };

  const handleSetProcessing = async (requestId) => {
    setProcessingLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'processing' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status to processing. Please try again.');
    } finally {
      setProcessingLoading(prev => { const copy = { ...prev }; delete copy[requestId]; return copy; });
    }
  };

  const handleRequestLibraries = (requestId) => {
    setSelectedRequestId(requestId);
    setShowLibraryModal(true);
    fetchLibraries();
  };

  const handleEdit = (request) => {
    setSelectedRequestId(request._id);
    setEditFormData({
      documentTitle: request.documentTitle || '',
      authors: request.authors || '',
      publicationName: request.publicationName || '',
      publisher: request.publisher || '',
      publicationYear: request.publicationYear || '',
      volumeNo: request.volumeNo || '',
      issueNo: request.issueNo || '',
      pageRange: request.pageRange || '',
      sourceUrl: request.sourceUrl || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const confirmEdit = async () => {
    if (!editFormData.documentTitle || !editFormData.authors) {
      setEditError('Document title and authors are required.');
      return;
    }

    setEditLoading(prev => ({ ...prev, [selectedRequestId]: true }));

    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/requests/edit/${selectedRequestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request');
      }

      await fetchRequests();
      setShowEditModal(false);
      setEditFormData({
        documentTitle: '',
        authors: '',
        publicationName: '',
        publisher: '',
        publicationYear: '',
        volumeNo: '',
        issueNo: '',
        pageRange: '',
        sourceUrl: '',
      });
      setSelectedRequestId(null);
      setEditError('');
    } catch (error) {
      setEditError(error.message || 'Failed to update request. Please try again.');
    } finally {
      setEditLoading(prev => { const copy = { ...prev }; delete copy[selectedRequestId]; return copy; });
    }
  };

  const handleLibrarySelect = (libraryId) => {
    setSelectedLibraries(prev =>
      prev.includes(libraryId)
        ? prev.filter(id => id !== libraryId)
        : [...prev, libraryId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'processing': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'pending': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      request.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.publicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.publisher.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
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
            <div className="flex items-center space-x-6 text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors font-medium">New Request</Link>
              <Link to="/library" className="hover:text-blue-600 transition-colors font-medium">Library</Link>
              <Link to="/adminPanel" className="hover:text-blue-600 transition-colors font-medium">Admin Panel</Link>
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
              <span>Admin Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Document Request <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review and manage document requests from users across the institution
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.processing || 0}</div>
                    <div className="text-sm text-amber-700">Processing</div>
                  </div>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-300 to-amber-400 h-2 rounded-full" style={{ width: `${((statusCounts.processing || 0) / requests.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Hourglass className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.pending || 0}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-2 rounded-full" style={{ width: `${((statusCounts.pending || 0) / requests.length) * 100}%` }}></div>
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
                    <div className="text-3xl font-bold text-gray-900">{statusCounts.accepted || 0}</div>
                    <div className="text-sm text-gray-600">Accepted</div>
                  </div>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: `${((statusCounts.accepted || 0) / requests.length) * 100}%` }}></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-lg font-semibold text-gray-900">
                  {filteredRequests.length} of {requests.length} requests
                </div>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-lg border border-white/20 overflow-visible">
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
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 bg-gray-50/50 border-b border-gray-200/50 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              <div className="col-span-4">Document Details</div>
              <div className="col-span-3">Requester Info</div>
              <div className="col-span-2">Publication</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Library Request</div>
              <div className="col-span-1">Actions</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredRequests.map((request, index) => (
                <div
                  key={request._id}
                  className="border-b border-gray-200/50 last:border-b-0 hover:bg-blue-50/30 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-4 lg:p-6 items-start">
                    <div className="col-span-4">
                      <div className="font-semibold text-gray-900 mb-1">{request.documentTitle}</div>
                      <div className="text-sm text-gray-600 mb-1">by {request.authors}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{request.publisher} • {request.publicationYear}</span>
                        {request.sourceUrl && (
                          <a href={request.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {request.pdfFileId && request.status === 'accepted' && (
                          <a
                            href={`http://localhost:5000/api/requests/file/${request.pdfFileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <FileText className="w-3 h-3" /> View PDF
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
                    <div className="col-span-3">
                      <div className="text-sm text-gray-600">{request.email}</div>
                      <div className="mt-2">
                        <span className={`text-xs font-medium px-3 py-2 rounded-full border ${getStatusColor(request.status)}`}>{request.status}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500">{request.publicationName}</div>
                    <div className="col-span-1 text-xs text-gray-500">{formatDate(request.requestedAt)}</div>
                    <div className="col-span-1">
                      <button
                        onClick={() => handleRequestLibraries(request._id)}
                        className="p-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                      >
                        <Send className="w-4 h-4 inline mr-1" /> Request
                      </button>
                    </div>
                    <div className="col-span-1 flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => handleEdit(request)}
                        disabled={!!editLoading[request._id]}
                        className={`p-2 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${editLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-200'}`}
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSetProcessing(request._id)}
                            disabled={!!processingLoading[request._id]}
                            className={`p-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${processingLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-200'}`}
                          >
                            {processingLoading[request._id] ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></div>
                                <span>Processing...</span>
                              </div>
                            ) : 'Process'}
                          </button>
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={!!approveLoading[request._id]}
                            className={`p-2 bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${approveLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-200'}`}
                          >
                            {approveLoading[request._id] ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                                <span>Accepting...</span>
                              </div>
                            ) : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={!!rejectLoading[request._id]}
                            className={`p-2 bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${rejectLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-200'}`}
                          >
                            {rejectLoading[request._id] ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                                <span>Rejecting...</span>
                              </div>
                            ) : 'Reject'}
                          </button>
                        </>
                      )}
                      {request.status === 'processing' && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={!!approveLoading[request._id]}
                            className={`p-2 bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${approveLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-200'}`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={!!rejectLoading[request._id]}
                            className={`p-2 bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap ${rejectLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-200'}`}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(request.status === 'accepted' || request.status === 'rejected') && (
                        <div className="text-center text-sm text-gray-500 font-medium py-2">Completed</div>
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
              <p className="text-gray-600">Supporting users with comprehensive document access services.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload PDF for Approval</h3>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={confirmApprove}
                disabled={!!approveLoading[selectedRequestId]}
                className={`flex-1 p-2 bg-green-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${approveLoading[selectedRequestId] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                {approveLoading[selectedRequestId] ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Confirming...</span>
                  </div>
                ) : 'Confirm Approval'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setPdfFile(null);
                  setSelectedRequestId(null);
                }}
                className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Rejection Reason</h3>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 mb-4"
            >
              <option value="">Select a reason</option>
              {rejectionReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={confirmReject}
                disabled={!!rejectLoading[selectedRequestId]}
                className={`flex-1 p-2 bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${rejectLoading[selectedRequestId] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
              >
                {rejectLoading[selectedRequestId] ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Confirming...</span>
                  </div>
                ) : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
                className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Request</h3>
            {editError && <p className="text-red-500 mb-4">{editError}</p>}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title *</label>
                <input
                  type="text"
                  name="documentTitle"
                  value={editFormData.documentTitle}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter document title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Authors *</label>
                <input
                  type="text"
                  name="authors"
                  value={editFormData.authors}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter authors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Name</label>
                <input
                  type="text"
                  name="publicationName"
                  value={editFormData.publicationName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter publication name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={editFormData.publisher}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter publisher"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Year</label>
                <input
                  type="number"
                  name="publicationYear"
                  value={editFormData.publicationYear}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter publication year"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Volume Number</label>
                <input
                  type="text"
                  name="volumeNo"
                  value={editFormData.volumeNo}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter volume number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Number</label>
                <input
                  type="text"
                  name="issueNo"
                  value={editFormData.issueNo}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter issue number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Range</label>
                <input
                  type="text"
                  name="pageRange"
                  value={editFormData.pageRange}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter page range (e.g., 1-10)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source URL</label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={editFormData.sourceUrl}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter source URL"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={confirmEdit}
                  disabled={!!editLoading[selectedRequestId]}
                  className={`flex-1 p-2 bg-yellow-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${editLoading[selectedRequestId] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-700'}`}
                >
                  {editLoading[selectedRequestId] ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormData({
                      documentTitle: '',
                      authors: '',
                      publicationName: '',
                      publisher: '',
                      publicationYear: '',
                      volumeNo: '',
                      issueNo: '',
                      pageRange: '',
                      sourceUrl: '',
                    });
                    setSelectedRequestId(null);
                    setEditError('');
                  }}
                  className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library Selection Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Libraries to Request Document</h3>
            {libraryModalError && <p className="text-red-500 mb-4">{libraryModalError}</p>}
            {libraryModalSuccess && <p className="text-green-500 mb-4">{libraryModalSuccess}</p>}
            {libraries.length === 0 ? (
              <p className="text-gray-500">No libraries available.</p>
            ) : (
              <div className="space-y-2">
                {libraries.map((library) => (
                  <div key={library._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={library._id}
                      checked={selectedLibraries.includes(library._id)}
                      onChange={() => handleLibrarySelect(library._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={library._id} className="ml-2 text-sm text-gray-900">
                      {library.name} ({library.email})
                    </label>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSendEmails}
                disabled={libraryModalLoading}
                className={`flex-1 p-2 bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium ${libraryModalLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {libraryModalLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : 'Send Requests'}
              </button>
              <button
                onClick={() => {
                  setShowLibraryModal(false);
                  setSelectedLibraries([]);
                  setLibraryModalError('');
                  setLibraryModalSuccess('');
                }}
                className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
}