import React, { useEffect, useState } from 'react';
import { Search, Eye, Download, Clock, CheckCircle, Truck, Package, MapPin, User, BookOpen, Users, Hourglass, X, GraduationCap, Building2, Mail, IdCard } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from '../utils/fetchWithAuth';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Check for token in localStorage when component mounts
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Load user data from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
                setStatus('Failed to load user data');
                setTimeout(() => setStatus(''), 4000);
            }
        } else {
            setStatus('Please log in to view your profile');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    }, [navigate]);

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
            } else {
                console.error('Logout failed:', response.statusText);
                alert('Failed to log out. Please try again.');
            }
        } catch (err) {
            console.error('Logout error:', err);
            alert('An error occurred during logout. Please try again.');
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetchWithAuth("http://localhost:5000/api/requests", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch requests");
                }

                const data = await response.json();
                setRequests(data);
                console.log(data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [navigate]);

    // Handle file download
    const handleDownload = async (fileId, documentTitle) => {
        try {
            const response = await fetchWithAuth(`http://localhost:5000/api/requests/file/${fileId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${documentTitle}.pdf` || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setStatus('File downloaded successfully');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error('Error downloading file:', error);
            setStatus(`Failed to download file: ${error.message}`);
            setTimeout(() => setStatus(''), 4000);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            processing: 'bg-amber-50 text-amber-700 border border-amber-200',
            pending: 'bg-slate-50 text-slate-700 border border-slate-200',
            accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            'pre-intransit': 'bg-blue-50 text-blue-700 border border-blue-200',
            rejected: 'bg-red-50 text-red-700 border border-red-200',
            completed: 'bg-green-50 text-green-700 border border-green-200'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Hourglass className="w-4 h-4" />,
            processing: <Clock className="w-4 h-4" />,
            accepted: <CheckCircle className="w-4 h-4" />,
            'pre-intransit': <Package className="w-4 h-4" />,
            rejected: <X className="w-4 h-4" />,
            'post-intransit': <Truck className="w-4 h-4" />,
            completed: <CheckCircle className="w-4 h-4" />
        };
        return icons[status] || <Clock className="w-4 h-4" />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Status Toast */}
            {status && (
                <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-600 shadow-xl rounded-lg p-4 max-w-md animate-slide-in">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <p className="text-slate-800 font-medium">{status}</p>
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
                                <BookOpen className="w-5 h-5 text-blue-700" />
                                <span className="text-lg font-semibold text-slate-800">Central Library Portal</span>
                            </div>
                        </div>

                        {/* Right: Navigation */}
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex items-center space-x-6">
                                <Link 
                                    to="/" 
                                    className="text-slate-700 hover:text-blue-700 font-medium transition-colors duration-200 flex items-center space-x-1"
                                >
                                    <span>New Request</span>
                                </Link>

                                {user?.role === 'admin' && (
                                    <Link 
                                        to="/dashboard" 
                                        className="text-slate-700 hover:text-blue-700 font-medium transition-colors duration-200"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                
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
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-3">
                            <Building2 className="w-4 h-4" />
                            <span>Dashboard</span>
                            <span>/</span>
                            <span className="text-blue-700 font-medium">My Requests</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Document Request Management</h2>
                        <p className="text-slate-600">View and track your document requests submitted to the Central Library</p>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
                        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4">
                            <div className="flex items-center space-x-3">
                                <User className="w-6 h-6 text-blue-700" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">User Information</h3>
                                    <p className="text-sm text-slate-600">Your registered profile details</p>
                                </div>
                            </div>
                        </div>
                        {user ? (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{user?.name}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-green-700" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900 break-all">{user?.email}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <IdCard className="w-5 h-5 text-amber-700" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Roll/Employee No</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{user?.rollNo}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-purple-700" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{user?.department}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <p className="text-slate-500 italic">Loading profile information...</p>
                            </div>
                        )}
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="w-5 h-5 text-blue-700" />
                                <h3 className="text-lg font-bold text-slate-900">Document Requests</h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                                    {requests.length} Total
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or publication..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full md:w-96 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Document Information
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Publication Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Request Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {requests.length > 0 ? (
                                        requests
                                            .filter(request => 
                                                searchTerm === '' || 
                                                request.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                request.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                request.publicationName?.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map((request, index) => (
                                                <tr key={request._id || index} className="hover:bg-slate-50 transition-colors duration-150">
                                                    <td className="px-6 py-5">
                                                        <div className="max-w-md">
                                                            <div className="font-bold text-slate-900 mb-1">{request.documentTitle ?? "Untitled Document"}</div>
                                                            <div className="text-sm text-slate-600">
                                                                <span className="font-medium">Author(s):</span> {request.authors ?? "Unknown"}
                                                            </div>
                                                            {request.publicationYear && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    Year: {request.publicationYear}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm">
                                                            <div className="font-semibold text-slate-900">{request.publicationName ?? "N/A"}</div>
                                                            {request.publisher && request.publisher !== request.publicationName && (
                                                                <div className="text-slate-600 mt-1">{request.publisher}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-medium text-slate-900">{formatDate(request.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(request.status)}`}>
                                                            {getStatusIcon(request.status)}
                                                            <span className="capitalize">{request.status?.replace('-', ' ') ?? "pending"}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <button
                                                            onClick={request.status === 'accepted' && request.pdfFileId ? () => handleDownload(request.pdfFileId, request.documentTitle) : undefined}
                                                            disabled={request.status !== 'accepted' || !request.pdfFileId}
                                                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                                request.status === 'accepted' && request.pdfFileId
                                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md cursor-pointer'
                                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            }`}
                                                            title={request.status !== 'accepted' ? 'Available after acceptance' : !request.pdfFileId ? 'No file available' : 'Download PDF'}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span>Download</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <BookOpen className="w-12 h-12 text-slate-300" />
                                                    <p className="text-slate-600 font-medium">No document requests found</p>
                                                    <Link 
                                                        to="/" 
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                                                    >
                                                        Submit New Request
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        {requests.length > 0 && (
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm">
                                    <p className="text-slate-600">
                                        Showing <span className="font-semibold text-slate-900">{requests.filter(r => 
                                            searchTerm === '' || 
                                            r.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            r.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            r.publicationName?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).length}</span> of <span className="font-semibold text-slate-900">{requests.length}</span> requests
                                    </p>
                                    <p className="text-slate-500">IIT Jodhpur Central Library</p>
                                </div>
                            </div>
                        )}
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

export default UserDashboard;