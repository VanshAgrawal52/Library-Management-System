import React, { useEffect, useState } from 'react';
import { Search, Eye, Download, Clock, CheckCircle, Truck, Package, MapPin, User, BookOpen, Users, Hourglass,X } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom"; // if you’re using React Router
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

    // Check for token in localStorage when component mounts
    useEffect(() => {
        // Load user data from localStorage
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
            // No user data found, redirect to login
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
                credentials: 'include', // Include cookies in the request
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // important for refresh cookie
            });

            if (response.ok) {
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
    }, [navigate]); // Ensure proper syntax for dependency array

    const getStatusColor = (status) => {
        const colors = {
            processing: 'bg-orange-100 text-orange-800',
            pending: 'bg-gray-100 text-gray-700',
            accepted: 'bg-blue-100 text-blue-800',
            'pre-intransit': 'bg-purple-100 text-purple-800',
            rejected: 'text-red-700 bg-red-100 border-red-200',
            completed: 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
        return <div className="p-10 text-center">Loading requests...</div>;
    }

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
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LibraryX</span>
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
                            <Link to="/" className="hover:text-blue-600 transition-colors font-medium">
                                New Request
                            </Link>
                            <Link to="/bookmarks" className="hover:text-blue-600 transition-colors font-medium">
                                Bookmarks
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
                            <Users className="w-4 h-4" />
                            <span>User Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            My Document <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Requests</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Track and manage your document requests with real-time status updates and easy access to your resources.
                        </p>
                    </div>

                    {/* User Profile Card */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 mb-12">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                <p className="text-gray-600">Your account information</p>
                            </div>
                        </div>
                        {user ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="group">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Full Name</p>
                                        <p className="text-lg font-bold text-gray-900">{user?.name}</p>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Email Address</p>
                                        <p className="text-lg font-bold text-gray-900">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Roll/Employee No</p>
                                        <p className="text-lg font-bold text-gray-900">{user?.rollNo}</p>
                                    </div>
                                </div>
                                <div className="group">
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Department</p>
                                        <p className="text-lg font-bold text-gray-900">{user?.department}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Loading profile...</p>
                        )}
                    </div>

                    {/* Requests Table */}
                    <div className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/20">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Document Requests</h2>
                                    <p className="text-gray-600">Your request history and status</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Document Details
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Publication
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Request Date
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/30 backdrop-blur-sm divide-y divide-white/20">
                                    {requests.map((request, index) => (
                                        <tr key={request._id || index} className="hover:bg-white/50 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <div className="font-bold text-gray-900 mb-1 text-lg">{request.documentTitle ?? "Untitled"}</div>
                                                    <div className="text-sm text-gray-600 font-medium">by {request.authors ?? "Unknown"}</div>
                                                    {request.publicationYear && (
                                                        <div className="text-sm text-gray-600 mt-1">Published: {request.publicationYear}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-semibold text-gray-900">{request.publicationName ?? "N/A"}</div>
                                                {request.publisher && request.publisher !== request.publicationName && (
                                                    <div className="text-sm text-gray-600 mt-1">{request.publisher}</div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="font-semibold text-gray-900">{formatDate(request.createdAt)}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(request.status)} shadow-sm`}>
                                                    {getStatusIcon(request.status)}
                                                    <span className="capitalize">{request.status?.replace('-', ' ') ?? "pending"}</span>
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-3">
                                                    <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {request.status === 'completed' && (
                                                        <button className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-green-300">
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>

                        <div className="px-8 py-6 bg-white/50 backdrop-blur-sm border-t border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-gray-700">
                                    Showing <span className="text-blue-600">1</span> to <span className="text-blue-600">{requests.length}</span> of{' '}
                                    <span className="text-blue-600">{requests.length}</span> requests
                                </div>
                                <div className="text-gray-600 font-medium">
                                    © 2025 LibraryX
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                        {/* <div className="mt-12 grid md:grid-cols-3 gap-6">
                            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Total Requests</h3>
                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{requests.length}</p>
                            </div>
                            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Completed</h3>
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                    {requests.filter(r => r.status === 'completed').length}
                                </p>
                            </div>
                            <div className="text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">In Progress</h3>
                                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                                    {requests.filter(r => r.status !== 'completed').length}
                                </p>
                            </div>
                        </div> */}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-white/80 backdrop-blur-sm border-t border-white/20 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="text-gray-600">© 2025 LibraryX. All rights reserved.</div>
                    <div className="flex items-center space-x-3 text-gray-600">
                        <span>Built with ❤️ by</span>
                        <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Kavya
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserDashboard;