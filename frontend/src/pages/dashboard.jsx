import React, { useState, useEffect } from 'react';
import { Search, User, Filter, Eye, Check, X, Clock, AlertCircle, FileText, ExternalLink, BookOpen, Calendar, TrendingUp, Activity, Hourglass, Users, Send, Edit2, GraduationCap, Building2, Mail, Package, CheckCircle } from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState('');

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
      setStatusMessage('Request accepted successfully');
      setTimeout(() => setStatusMessage(''), 3000);
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
      setStatusMessage('Request rejected');
      setTimeout(() => setStatusMessage(''), 3000);
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
      setStatusMessage('Status updated to processing');
      setTimeout(() => setStatusMessage(''), 3000);
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
      setStatusMessage('Request updated successfully');
      setTimeout(() => setStatusMessage(''), 3000);
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
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-200';
      case 'processing': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'pending': return 'bg-slate-50 text-slate-700 border border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Hourglass className="w-4 h-4" />,
      processing: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <X className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Status Toast */}
      {statusMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-600 shadow-xl rounded-lg p-4 max-w-md animate-slide-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <p className="text-slate-800 font-medium">{statusMessage}</p>
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
                <span className="text-lg font-semibold text-slate-800">Central Library - Admin Portal</span>
              </div>
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">New Request</Link>
                <Link to="/library" className="text-slate-700 hover:text-blue-700 font-medium transition-colors">Library</Link>
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
              <span className="text-blue-700 font-medium">Request Management</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Request Management</h2>
            <p className="text-slate-600">Review, process, and manage all document requests from the IIT Jodhpur community</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{statusCounts.processing || 0}</div>
                  <div className="text-sm text-slate-600">Processing</div>
                </div>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${((statusCounts.processing || 0) / requests.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Hourglass className="w-6 h-6 text-slate-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{statusCounts.pending || 0}</div>
                  <div className="text-sm text-slate-600">Pending</div>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-slate-600 h-2 rounded-full" style={{ width: `${((statusCounts.pending || 0) / requests.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{statusCounts.accepted || 0}</div>
                  <div className="text-sm text-slate-600">Accepted</div>
                </div>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${((statusCounts.accepted || 0) / requests.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-red-700" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{statusCounts.rejected || 0}</div>
                  <div className="text-sm text-slate-600">Rejected</div>
                </div>
              </div>
              <div className="w-full bg-red-100 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${((statusCounts.rejected || 0) / requests.length) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Filter & Search</h3>
                <p className="text-sm text-slate-600">Refine your view to find specific requests</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status Filter</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-end">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by title, author, email, publication..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredRequests.length}</span> of <span className="font-semibold text-slate-900">{requests.length}</span> requests
              </p>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Document Requests</h3>
                  <p className="text-sm text-slate-600">Review and process incoming document requests</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Document Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Publication
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="max-w-md">
                            <div className="font-bold text-slate-900 mb-1">{request.documentTitle}</div>
                            <div className="text-sm text-slate-600 mb-1">
                              <span className="font-medium">Authors:</span> {request.authors}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{request.publisher} • {request.publicationYear}</span>
                              {request.sourceUrl && (
                                <a href={request.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {request.pdfFileId && request.status === 'accepted' && (
                                <a
                                  href={`http://localhost:5000/api/requests/file/${request.pdfFileId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" /> PDF
                                </a>
                              )}
                            </div>
                            {(request.volumeNo || request.issueNo || request.pageRange) && (
                              <div className="text-xs text-slate-500 mt-1">
                                {request.volumeNo && `Vol. ${request.volumeNo}`}
                                {request.issueNo && ` Issue ${request.issueNo}`}
                                {request.pageRange && ` pp. ${request.pageRange}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-900 font-medium">{request.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-900">{request.publicationName}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="capitalize">{request.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-900">{formatDate(request.requestedAt)}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(request)}
                                disabled={!!editLoading[request._id]}
                                className={`p-2 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg transition-colors text-xs font-medium ${editLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-200'}`}
                                title="Edit Request"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRequestLibraries(request._id)}
                                className="p-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                                title="Request from Libraries"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSetProcessing(request._id)}
                                  disabled={!!processingLoading[request._id]}
                                  className={`px-3 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors text-xs font-medium ${processingLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-200'}`}
                                >
                                  {processingLoading[request._id] ? 'Processing...' : 'Process'}
                                </button>
                                <button
                                  onClick={() => handleApprove(request._id)}
                                  disabled={!!approveLoading[request._id]}
                                  className={`px-3 py-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors text-xs font-medium ${approveLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-200'}`}
                                >
                                  {approveLoading[request._id] ? 'Accepting...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleReject(request._id)}
                                  disabled={!!rejectLoading[request._id]}
                                  className={`px-3 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors text-xs font-medium ${rejectLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-200'}`}
                                >
                                  {rejectLoading[request._id] ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            )}
                            {request.status === 'processing' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(request._id)}
                                  disabled={!!approveLoading[request._id]}
                                  className={`px-3 py-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors text-xs font-medium ${approveLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-200'}`}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(request._id)}
                                  disabled={!!rejectLoading[request._id]}
                                  className={`px-3 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors text-xs font-medium ${rejectLoading[request._id] ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-200'}`}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {(request.status === 'accepted' || request.status === 'rejected') && (
                              <div className="text-center text-xs text-slate-500 font-medium py-2 -mt-10">
                                Completed
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <AlertCircle className="w-12 h-12 text-slate-300" />
                          <p className="text-slate-600 font-medium">No requests found</p>
                          <p className="text-sm text-slate-500">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {filteredRequests.length > 0 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{filteredRequests.length}</span> of <span className="font-semibold text-slate-900">{requests.length}</span> requests
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
                <FileText className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Document Types</h3>
              <p className="text-slate-600 text-center">Managing journal articles, books, conference papers, and research documents from various academic sources.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Quick Processing</h3>
              <p className="text-slate-600 text-center">Streamlined workflow ensures most document requests are processed and delivered within 2-3 business days.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Community Support</h3>
              <p className="text-slate-600 text-center">Serving the entire IIT Jodhpur academic community with comprehensive document access services.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Approve Request</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">Upload the document PDF to approve this request</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {pdfFile && (
                <p className="mt-2 text-sm text-slate-600">Selected: {pdfFile.name}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmApprove}
                disabled={!!approveLoading[selectedRequestId] || !pdfFile}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${approveLoading[selectedRequestId] || !pdfFile
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
              >
                {approveLoading[selectedRequestId] ? 'Approving...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setPdfFile(null);
                  setSelectedRequestId(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Reject Request</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">Please select a reason for rejecting this request</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rejection Reason</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                disabled={!!rejectLoading[selectedRequestId] || !rejectReason}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${rejectLoading[selectedRequestId] || !rejectReason
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
              >
                {rejectLoading[selectedRequestId] ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequestId(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit2 className="w-6 h-6 text-yellow-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Edit Request Details</h3>
            </div>
            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{editError}</p>
              </div>
            )}
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Title *</label>
                  <input
                    type="text"
                    name="documentTitle"
                    value={editFormData.documentTitle}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter document title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Authors *</label>
                  <input
                    type="text"
                    name="authors"
                    value={editFormData.authors}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter authors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Publication Name</label>
                  <input
                    type="text"
                    name="publicationName"
                    value={editFormData.publicationName}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter publication name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={editFormData.publisher}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter publisher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Publication Year</label>
                  <input
                    type="number"
                    name="publicationYear"
                    value={editFormData.publicationYear}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Volume Number</label>
                  <input
                    type="text"
                    name="volumeNo"
                    value={editFormData.volumeNo}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Vol. number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Number</label>
                  <input
                    type="text"
                    name="issueNo"
                    value={editFormData.issueNo}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Issue number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Page Range</label>
                  <input
                    type="text"
                    name="pageRange"
                    value={editFormData.pageRange}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., 1-10"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Source URL</label>
                  <input
                    type="url"
                    name="sourceUrl"
                    value={editFormData.sourceUrl}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={confirmEdit}
                  disabled={!!editLoading[selectedRequestId]}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${editLoading[selectedRequestId]
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                >
                  {editLoading[selectedRequestId] ? 'Saving...' : 'Save Changes'}
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
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Request from Libraries</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">Select one or more libraries to send document request emails</p>

            {libraryModalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{libraryModalError}</p>
              </div>
            )}
            {libraryModalSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">{libraryModalSuccess}</p>
              </div>
            )}

            {libraries.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No libraries available</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {libraries.map((library) => (
                  <div key={library._id} className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      id={library._id}
                      checked={selectedLibraries.includes(library._id)}
                      onChange={() => handleLibrarySelect(library._id)}
                      className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={library._id} className="ml-3 flex-1 cursor-pointer">
                      <div className="font-medium text-slate-900">{library.name}</div>
                      <div className="text-sm text-slate-600">{library.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSendEmails}
                disabled={libraryModalLoading || selectedLibraries.length === 0}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${libraryModalLoading || selectedLibraries.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {libraryModalLoading ? 'Sending...' : `Send to ${selectedLibraries.length} ${selectedLibraries.length === 1 ? 'Library' : 'Libraries'}`}
              </button>
              <button
                onClick={() => {
                  setShowLibraryModal(false);
                  setSelectedLibraries([]);
                  setLibraryModalError('');
                  setLibraryModalSuccess('');
                }}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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